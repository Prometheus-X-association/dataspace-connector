# Control Plane Service Chain Sandbox Verification

This guide verifies a control-plane exchange that uses a service chain. It shows that each node of the chain is authorized in order, then reports its transfer in order, and that every connector only handles metadata. For the general control-plane setup, see [control-plane.md](control-plane.md). For the rules applied by the connector, see the Service Chains section of [CONTROL_PLANE.md](../CONTROL_PLANE.md).

The chain used here is `670e8eb6b439a2379f290fc7` (see [dpcp-project.md](dpcp-project.md)). It has three nodes, in this order:

| Index | Role | Participant | Service |
| --- | --- | --- | --- |
| 0 | Provider | `66d18724ee71f9f096bae810` | `66d187f4ee71f9f096bae8ca` |
| 1 | Intermediate | `66d18a1dee71f9f096baec07` | `66d18b79ee71f9f096baecb7` |
| 2 | Consumer | `66d18a1dee71f9f096baec08` | `66d18b79ee71f9f096baecb1` |

Each connector identifies its own node by matching its endpoint with the `dataspaceEndpoint` of the participant in the catalog. Make sure every participant of the chain is reachable in your sandbox before starting.

## Start the Sandbox

From `sandbox/infrastructure`, build and start the stack:

```bash
docker compose up --build -d
```

Both sandbox connector configurations must enable the control-plane workflow (`controlPlaneEnabled: true`). Every connector that owns a node of the chain must have it enabled.

## Obtain Connector Tokens

Follow the login requests in [provider-consumer-project.md](provider-consumer-project.md). Save the provider token as `PROVIDER_TOKEN` and the consumer token as `CONSUMER_TOKEN`. If a connector owns the intermediate node, save its token as `INTERMEDIATE_TOKEN` and its URL as `INTERMEDIATE_URL`.

## Create the Exchange

Create the exchange from the consumer connector, with the `serviceChainId`:

```bash
curl -X POST http://localhost:3030/controlplane/exchanges \
  -H "Authorization: Bearer ${CONSUMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "contract": "http://contract:8081/contracts/66db1a6dc29e3ba863a85e0f",
    "resourceId": "http://catalog:8082/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca",
    "purposeId": "http://catalog:8082/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb1",
    "serviceChainId": "670e8eb6b439a2379f290fc7"
  }'
```

Save `content._id` as `CONSUMER_EXCHANGE_ID` and `content.providerDataExchange` as `PROVIDER_EXCHANGE_ID`.

Check the chain on each connector:

```bash
curl -H "Authorization: Bearer ${CONSUMER_TOKEN}" \
  http://localhost:3030/controlplane/exchanges/${CONSUMER_EXCHANGE_ID}
```

The response must contain `workflow: "control-plane"` and `serviceChain.services` with three entries. None of them has `participantAuthorizedAt` or `transferCompletedAt` yet.

## Authorize the Nodes in Order

In service-chain mode the connector selects the node from its own endpoint, so the `participant` field is only required by the validator. Authorization must follow the chain order.

1. Provider node (index 0):

```bash
curl -X POST http://localhost:3010/controlplane/exchanges/${PROVIDER_EXCHANGE_ID}/authorize \
  -H "Authorization: Bearer ${PROVIDER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"provider"}'
```

2. Intermediate node (index 1), from the connector that owns it:

```bash
curl -X POST ${INTERMEDIATE_URL}/controlplane/exchanges/${EXCHANGE_ID}/authorize \
  -H "Authorization: Bearer ${INTERMEDIATE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"infrastructure"}'
```

3. Consumer node (index 2):

```bash
curl -X POST http://localhost:3030/controlplane/exchanges/${CONSUMER_EXCHANGE_ID}/authorize \
  -H "Authorization: Bearer ${CONSUMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"consumer"}'
```

Each call must return `content.authorized: true`. After each success, `participantAuthorizedAt` is set on the node and the updated chain is synchronized with the other connectors.

### Check the Ordering Rules

Before step 1 completes, repeat step 3 on a fresh exchange. It must return `403` with the message `Previous participant must be authorized first`. Repeating an already successful authorization returns `409`.

## Report the Transfers in Order

Every node must be authorized before any transfer report is accepted. Reports then follow the chain order. Each report contains metadata only.

1. Provider node (index 0), the status becomes `EXPORT_SUCCESS`:

```bash
curl -X POST http://localhost:3010/controlplane/exchanges/${PROVIDER_EXCHANGE_ID}/transfer \
  -H "Authorization: Bearer ${PROVIDER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"provider","success":true,"metadata":{"checksum":"sha256:example","mimetype":"application/json","size":49}}'
```

2. Intermediate node (index 1), the status is unchanged:

```bash
curl -X POST ${INTERMEDIATE_URL}/controlplane/exchanges/${EXCHANGE_ID}/transfer \
  -H "Authorization: Bearer ${INTERMEDIATE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"infrastructure","success":true,"metadata":{"checksum":"sha256:example","mimetype":"application/json","size":49}}'
```

3. Consumer node (index 2), the status becomes `IMPORT_SUCCESS`:

```bash
curl -X POST http://localhost:3030/controlplane/exchanges/${CONSUMER_EXCHANGE_ID}/transfer \
  -H "Authorization: Bearer ${CONSUMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"consumer","success":true,"metadata":{"checksum":"sha256:example","mimetype":"application/json","size":49}}'
```

### Check the Ordering Rules

- A transfer report sent before all nodes are authorized returns `403`.
- A report sent before the previous node completed its transfer returns `403` with the message `Previous participant must complete its transfer first`.
- A second report from the same node returns `409`.
- A report with `success: false` sets `PROVIDER_EXPORT_ERROR` on the first node, and `CONSUMER_IMPORT_ERROR` on any other node.

## Verify the Final State

Query the exchange on every connector:

```bash
curl -H "Authorization: Bearer ${CONSUMER_TOKEN}" \
  http://localhost:3030/controlplane/exchanges/${CONSUMER_EXCHANGE_ID}
```

The final record must show:

- `status: "IMPORT_SUCCESS"`.
- A `participantAuthorizedAt` and a `transferCompletedAt` on each of the three services, with timestamps increasing from index 0 to index 2.
- Only the completion metadata in `providerData`, and no business payload.

## Cleanup

```bash
docker compose down -v
```

