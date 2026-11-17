# Control Plane and Data Plane Separation

The connector can run a control-plane-only workflow alongside its established embedded data exchange workflow. In the control-plane workflow, the connector validates contracts, policies, and consent, while the provider and consumer applications transfer data directly between themselves.

The workflow is disabled by default. Existing `/exchange`, `/consumer/exchange`, `/provider/*`, `/data/*`, and `/consent/*` endpoints retain their embedded behavior and continue to move data through the connector.

## Operational Boundary

```mermaid
flowchart LR
    Client[Exchange initiator] -->|Create and reauthorize exchange| ConsumerConnector[Consumer Connector]
    ConsumerConnector <-->|Synchronize exchange metadata| ProviderConnector[Provider Connector]
    ConsumerConnector -->|Contract and policy checks| ContractService[Contract Service]
    ProviderConnector -->|Contract and policy checks| ContractService
    ConsumerConnector -->|Consent checks when applicable| ConsentService[Consent Service]
    ProviderConnector -->|Consent checks when applicable| ConsentService
    ProviderApplication -->|Direct data transfer| ConsumerApplication
    ConsumerConnector -->|Metadata-only lifecycle events| Operations[Configured webhook listeners]
    ProviderConnector -->|Metadata-only lifecycle events| Operations
```

The line between participant applications is the data plane. The connector does not proxy, inspect, persist, or forward that payload. All other calls shown are control-plane operations or metadata-only lifecycle notifications.

## Enable the Workflow

Set the following fields in `src/config.json` or through the connector configuration API:

```json
{
    "controlPlaneEnabled": true,
    "controlPlaneWebhookUrls": ["https://operations.example/events"]
}
```

`controlPlaneWebhookUrls` is optional. Each URL receives best-effort lifecycle events. A trigger request can add a per-exchange HTTPS `callbackUrl`; it is combined with the configured listeners and duplicate URLs receive one event.

## What Is Covered

-   Bilateral B2B exchanges created through `POST /controlplane/exchanges`.
-   Ecosystem or project exchanges created through the same endpoint with `contract`, `resourceId`, and `purposeId`.
-   Consent-driven exchanges created through `POST /controlplane/consent/exchanges`.
-   Provider and consumer policy reauthorization immediately before direct transfer.
-   Fresh signed-consent validation during reauthorization for consent exchanges.
-   Metadata-only transfer completion and failure reporting.
-   Optional best-effort lifecycle webhooks.
-   Service-chain exchanges: sequential authorization and transfer reporting for each node of the chain (see [Service Chains](#service-chains)).

## Not Yet Covered

-   Infrastructure-node orchestration and execution of the services themselves (the connector only controls authorization and ordering).
-   Proxying, fetching, or forwarding business data through the connector.
-   Connector-issued exchange tokens, mTLS, and signed participant requests.
-   Reliable webhook delivery, retries, or a durable event queue.
-   Payload storage, payload audit logs, or connector verification that participant applications actually received raw data.

## Service Chains

When an exchange is created with a `serviceChainId` (and optional `serviceChainParams`), the connector stores the chain in the exchange record and synchronizes it with the other participants through `synchronizeServiceChain`. Each entry of `serviceChain.services` represents a node (`participant`, `service`, `configuration`, `params`) and carries two control-plane timestamps: `participantAuthorizedAt` and `transferCompletedAt`.

The first node is treated as the provider and the last node as the consumer. Nodes in between are intermediate services.

### Node Identification

The connector resolves the `dataspaceEndpoint` of each node participant from the catalog and matches it with its own endpoint. If no node matches, the request returns `403`. The `participant` field of the request body is not used to select the node in this mode.

### Authorization

`POST /controlplane/exchanges/{id}/authorize` applies these rules on the local node:

1.  The authorization window (`authorizationExpiresAt`) must still be valid, otherwise the response is `200` with `authorized: false` (returned as `403`).
2.  The previous node must already be authorized, otherwise the request returns `403`.
3.  A node can be authorized only once, otherwise the request returns `409`.
4.  A node whose service is an `infrastructureservices` offering is authorized directly. Any other node is evaluated with the current contract policies for its service offering.
5.  On success, `participantAuthorizedAt` is set and the updated exchange is synchronized with every other node connector of the chain.

Authorization therefore proceeds in chain order, from the provider to the consumer.

### Transfer Reporting

`POST /controlplane/exchanges/{id}/transfer` applies these rules:

1.  A node can report its transfer only once, otherwise the request returns `409`.
2.  Every node of the chain must be authorized first, otherwise the request returns `403`.
3.  The previous node must have completed its transfer, otherwise the request returns `403`.
4.  On success, `transferCompletedAt` is set. Metadata (checksum, MIME type, size) is stored as for standard exchanges.

The exchange status is derived from the position of the node:

| Node | Success | Failure |
| --- | --- | --- |
| First (provider) | `EXPORT_SUCCESS` | `PROVIDER_EXPORT_ERROR` |
| Intermediate | unchanged | `CONSUMER_IMPORT_ERROR` |
| Last (consumer) | `IMPORT_SUCCESS` | `CONSUMER_IMPORT_ERROR` |

After a successful report, the exchange is synchronized with the other nodes, and `transfer.completed` or `transfer.failed` is published.

### Peer Synchronization

Connectors update each other through `PUT /controlplane/exchanges/{id}`, which receives the workflow, control-plane state, endpoints, provider metadata, status, error, and service chain. The identifier can be the local exchange ID, the consumer exchange ID, or the provider exchange ID.

## API Workflow

All control-plane endpoints require the established Bearer JWT authentication. The workflow returns `404` while disabled.

External orchestration systems can create bilateral or ecosystem exchanges through `POST /controlplane/exchanges/external/trigger`. This endpoint accepts the same request body as the authenticated trigger and requires the `x-exchange-trigger-api-key` header. It uses the existing `EXCHANGE_TRIGGER_API_KEY` configuration.

The connector validates external-trigger API keys before validating the exchange request body. This avoids passing unauthenticated requests into contract or catalog processing.

### 1. Create an Exchange

For bilateral and ecosystem exchanges, call `POST /controlplane/exchanges`. The request fields match the existing exchange trigger fields, without `data` or direct-response options.

```json
{
    "contract": "https://contract.example/contracts/contract-id",
    "resourceId": "https://catalog.example/serviceofferings/provider-offering",
    "purposeId": "https://catalog.example/serviceofferings/consumer-offering",
    "resources": [
        {
            "resource": "https://catalog.example/dataresources/customer-records"
        }
    ],
    "callbackUrl": "https://consumer.example/control-plane-events"
}
```

The connector creates and synchronizes a `DataExchange` record, resolves participant endpoints, and returns the exchange context. It does not call provider data resources or consumer receiving resources.

For consent exchanges, call `POST /controlplane/consent/exchanges` with `signedConsent`, `encrypted`, and an optional `callbackUrl`. The signed-consent material is used for validation and is not persisted in the exchange record.

### 2. Reauthorize Before Transfer

Immediately before transferring data, each participant asks its own connector to authorize its role:

```json
{
    "participant": "provider"
}
```

Send the request to `POST /controlplane/exchanges/{id}/authorize`. The provider checks data resources; the consumer checks purpose resources. Both checks retrieve current policy state. Consent exchanges must include the fresh `signedConsent` and `encrypted` fields, and the consent ID must match the exchange record.

A `200` response has `content.authorized: true`. A policy denial or expired authorization returns `403`. An exchange created by another workflow or a missing exchange returns `404`.

### 3. Transfer Directly

After both checks succeed, the provider application sends data directly to the consumer application using the participant-owned transport and authentication method. The connector does not define the payload protocol or receive the payload.

Participants can use the existing `x-ptx-dataExchangeId`, `x-ptx-contractId`, and `x-ptx-contractURL` headers as correlation context. Do not send connector credentials, signed consent, or user tokens to the peer application unless the participant-to-participant protocol explicitly requires and protects them.

### 4. Report Completion

Each participant reports its view of the transfer through `POST /controlplane/exchanges/{id}/transfer`.

```json
{
    "participant": "provider",
    "success": true,
    "metadata": {
        "checksum": "sha256:example",
        "mimetype": "application/json",
        "size": 1024
    }
}
```

The report requires a successful authorization for that participant. It stores and synchronizes only the status, timestamp, checksum, MIME type, and size. It must not contain raw business data.

### 5. Read Exchange Status

Call `GET /controlplane/exchanges/{id}` to retrieve the current control-plane exchange state. The response contains participant endpoints, contract reference, authorization timestamps, lifecycle status, and metadata-only transfer information. It does not expose raw data, participant representation credentials, signed consent material, or connector tokens.

## Example Journeys

### Bilateral Data Delivery

1. The consumer creates a control-plane exchange using a signed bilateral contract and its selected resources.
2. Both connectors store matching exchange records and publish `exchange.created` events where configured.
3. The provider calls authorization for `provider`; its connector applies the current contract policies to each data resource.
4. The consumer calls authorization for `consumer`; its connector applies the current contract policies to each purpose resource.
5. The provider application transfers the data directly to the consumer application.
6. Both sides report transfer metadata and receive `transfer.completed` events.

```mermaid
sequenceDiagram
    participant ConsumerApp as Consumer Application
    participant ConsumerPDC as Consumer Connector
    participant ProviderPDC as Provider Connector
    participant ProviderApp as Provider Application
    participant Contract as Contract Service
    participant Events as Webhook Listener

    ConsumerApp->>ConsumerPDC: Create control-plane exchange
    ConsumerPDC->>Contract: Resolve contract and exchange context
    ConsumerPDC->>ProviderPDC: Create matching exchange record
    ConsumerPDC-->>Events: exchange.created
    ProviderPDC-->>Events: exchange.created
    ProviderApp->>ProviderPDC: Authorize provider role
    ProviderPDC->>Contract: Refresh policy evaluation
    ProviderPDC-->>ProviderApp: Authorized
    ConsumerApp->>ConsumerPDC: Authorize consumer role
    ConsumerPDC->>Contract: Refresh policy evaluation
    ConsumerPDC-->>ConsumerApp: Authorized
    ProviderApp->>ConsumerApp: Direct payload transfer
    ProviderApp->>ProviderPDC: Report transfer metadata
    ConsumerApp->>ConsumerPDC: Report transfer metadata
    ProviderPDC-->>Events: transfer.completed
    ConsumerPDC-->>Events: transfer.completed
```

### Consent-Based Delivery

1. The consent workflow submits a current signed consent to create the control-plane exchange.
2. The connector validates the consent, derives the contract, provider resources, consumer purposes, and peer endpoint, then creates synchronized records.
3. Before transfer, provider and consumer each submit current signed-consent material when requesting authorization.
4. The connector verifies the consent again, confirms it belongs to the exchange, and evaluates the applicable policies.
5. The participant applications transfer data directly and report metadata-only completion.

```mermaid
sequenceDiagram
    participant Consent as Consent Service
    participant ProviderPDC as Provider Connector
    participant ConsumerPDC as Consumer Connector
    participant ProviderApp as Provider Application
    participant ConsumerApp as Consumer Application

    Consent->>ProviderPDC: Create exchange with signed consent
    ProviderPDC->>Consent: Validate signed consent
    ProviderPDC->>ConsumerPDC: Create matching exchange record
    ProviderApp->>ProviderPDC: Reauthorize with current signed consent
    ProviderPDC->>Consent: Validate consent again
    ProviderPDC-->>ProviderApp: Authorized
    ConsumerApp->>ConsumerPDC: Reauthorize with current signed consent
    ConsumerPDC->>Consent: Validate consent again
    ConsumerPDC-->>ConsumerApp: Authorized
    ProviderApp->>ConsumerApp: Direct personal-data transfer
    ProviderApp->>ProviderPDC: Report metadata-only completion
    ConsumerApp->>ConsumerPDC: Report metadata-only completion
```

### Service Chain Journey

```mermaid
sequenceDiagram
    participant ConsumerApp as Consumer Application
    participant ConsumerPDC as Consumer Connector (node 2)
    participant InterPDC as Intermediate Connector (node 1)
    participant ProviderPDC as Provider Connector (node 0)
    participant ProviderApp as Provider Application

    ConsumerApp->>ConsumerPDC: Create exchange with serviceChainId
    ConsumerPDC->>ProviderPDC: Create matching exchange record
    ConsumerPDC->>InterPDC: Create matching exchange record
    ProviderApp->>ProviderPDC: Authorize (node 0)
    ProviderPDC->>ProviderPDC: Set participantAuthorizedAt
    ProviderPDC->>InterPDC: Synchronize service chain
    ProviderPDC->>ConsumerPDC: Synchronize service chain
    InterPDC->>InterPDC: Authorize (node 1), previous node authorized
    InterPDC->>ProviderPDC: Synchronize service chain
    InterPDC->>ConsumerPDC: Synchronize service chain
    ConsumerApp->>ConsumerPDC: Authorize (node 2), previous node authorized
    ConsumerPDC->>ProviderPDC: Synchronize service chain
    ConsumerPDC->>InterPDC: Synchronize service chain
    ProviderApp->>ProviderPDC: Report transfer (node 0), EXPORT_SUCCESS
    ProviderPDC->>InterPDC: Synchronize transferCompletedAt
    InterPDC->>InterPDC: Report transfer (node 1), previous node completed
    InterPDC->>ConsumerPDC: Synchronize transferCompletedAt
    ConsumerApp->>ConsumerPDC: Report transfer (node 2), IMPORT_SUCCESS
    ConsumerPDC->>ProviderPDC: Synchronize final state
    ConsumerPDC->>InterPDC: Synchronize final state
```

### Synchronized Data Exchange Example

The following record is what each connector holds after all nodes were authorized and the first two nodes completed their transfer. The two control-plane fields of each node are `participantAuthorizedAt` and `transferCompletedAt`. The last node has not reported its transfer yet, so `transferCompletedAt` is absent.

```json
{
    "_id": "6a2805a3b1f55f757e783e00",
    "workflow": "control-plane",
    "status": "EXPORT_SUCCESS",
    "contract": "https://contract.example/contracts/contract-id",
    "serviceChainId": "670e8eb6b439a2379f290fc7",
    "serviceChain": {
        "catalogId": "670e8eb6b439a2379f290fc7",
        "services": [
            {
                "participant": "https://catalog.example/participants/66d18724ee71f9f096bae810",
                "service": "https://catalog.example/serviceofferings/66d187f4ee71f9f096bae8ca",
                "participantAuthorizedAt": "2026-10-21T09:00:01.000Z",
                "transferCompletedAt": "2026-10-21T09:00:10.000Z"
            },
            {
                "participant": "https://catalog.example/participants/66d18a1dee71f9f096baec07",
                "service": "https://catalog.example/serviceofferings/66d18b79ee71f9f096baecb7",
                "configuration": "671a73867bb2447c8085d96f",
                "params": { "custom": "custom" },
                "participantAuthorizedAt": "2026-10-21T09:00:03.000Z",
                "transferCompletedAt": "2026-10-21T09:00:12.000Z"
            },
            {
                "participant": "https://catalog.example/participants/66d18a1dee71f9f096baec08",
                "service": "https://catalog.example/serviceofferings/66d18b79ee71f9f096baecb1",
                "configuration": "6720a0249cb2e866c196c10f",
                "params": { "custom": "custom" },
                "participantAuthorizedAt": "2026-10-21T09:00:05.000Z"
            }
        ]
    }
}
```

Timestamps increase along the chain: each `participantAuthorizedAt` is later than the previous node's, and each `transferCompletedAt` is later than the previous node's. Once the last node reports, it gets its own `transferCompletedAt` and the status becomes `IMPORT_SUCCESS`.

## Webhook Events

The connector emits `exchange.created`, `participant.authorized`, `participant.denied`, `transfer.completed`, and `transfer.failed`. The event includes exchange IDs, endpoints, workflow state, authorization timestamps, and transfer metadata where available. It does not include raw data, representation credentials, consent plaintext, or connector tokens.

Webhook delivery has a five-second request timeout and is best effort. A delivery failure is logged but does not invalidate an otherwise authorized transfer.
