# Control Plane Sandbox Verification

This guide verifies a two-connector control-plane exchange using the sandbox provider and consumer connectors. It proves that connectors synchronize metadata, authorize participants independently, and receive only metadata after a direct payload transfer.

The direct receiver is available at `http://localhost:3032`. It is a sandbox-only consumer application fixture, not part of the connector API.

## Start the Sandbox

From `sandbox/infrastructure`, build and start the stack:

```bash
docker compose up --build -d
```

The provider connector is available at `http://localhost:3010`, the consumer connector at `http://localhost:3030`, and the direct receiver at `http://localhost:3032`.

Both sandbox connector configurations enable the control-plane workflow. Do not copy this setting into a production deployment without deciding the participant authentication and transport requirements described in [CONTROL_PLANE.md](../CONTROL_PLANE.md).

## Obtain Connector Tokens

Follow the provider and consumer login requests in [provider-consumer-project.md](provider-consumer-project.md). Save the provider token as `PROVIDER_TOKEN` and the consumer token as `CONSUMER_TOKEN`.

## Create and Synchronize an Exchange

Create an ecosystem exchange from the consumer connector:

```bash
curl -X POST http://localhost:3030/controlplane/exchanges \
  -H "Authorization: Bearer ${CONSUMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "contract": "http://contract:8081/contracts/66db1a6dc29e3ba863a85e0f",
    "resourceId": "http://catalog:8082/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca",
    "purposeId": "http://catalog:8082/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb1"
  }'
```

Save `content._id` from the response as `CONSUMER_EXCHANGE_ID`. The response also includes `providerDataExchange`, which is the peer record ID used by the provider connector. Save it as `PROVIDER_EXCHANGE_ID`.

Verify that both connectors expose the metadata-only control-plane record:

```bash
curl -H "Authorization: Bearer ${CONSUMER_TOKEN}" \
  http://localhost:3030/controlplane/exchanges/${CONSUMER_EXCHANGE_ID}

curl -H "Authorization: Bearer ${PROVIDER_TOKEN}" \
  http://localhost:3010/controlplane/exchanges/${PROVIDER_EXCHANGE_ID}
```

Both responses must contain `workflow: "control-plane"`, both connector endpoints, and no `data` field containing a business payload.

## Reauthorize Both Participants

Authorize the provider before it sends data:

```bash
curl -X POST http://localhost:3010/controlplane/exchanges/${PROVIDER_EXCHANGE_ID}/authorize \
  -H "Authorization: Bearer ${PROVIDER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"provider"}'
```

Authorize the consumer before it accepts data:

```bash
curl -X POST http://localhost:3030/controlplane/exchanges/${CONSUMER_EXCHANGE_ID}/authorize \
  -H "Authorization: Bearer ${CONSUMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"consumer"}'
```

Both responses must return `content.authorized: true`. A denial, expired authorization, or mismatched participant role returns `403`.

## Transfer Directly and Report Metadata

Send the payload directly to the sandbox receiver. This request does not go through either connector:

```bash
curl -X POST http://localhost:3032/transfer \
  -H "Content-Type: application/json" \
  -H "x-ptx-dataExchangeId: ${CONSUMER_EXCHANGE_ID}" \
  -d '{"recordId":"example-1","value":"direct-transfer"}'
```

Verify the receiver got the direct payload:

```bash
curl http://localhost:3032/received
```

Report completion to each connector with metadata only:

```bash
curl -X POST http://localhost:3010/controlplane/exchanges/${PROVIDER_EXCHANGE_ID}/transfer \
  -H "Authorization: Bearer ${PROVIDER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"provider","success":true,"metadata":{"checksum":"sha256:example","mimetype":"application/json","size":49}}'

curl -X POST http://localhost:3030/controlplane/exchanges/${CONSUMER_EXCHANGE_ID}/transfer \
  -H "Authorization: Bearer ${CONSUMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"participant":"consumer","success":true,"metadata":{"checksum":"sha256:example","mimetype":"application/json","size":49}}'
```

Query both status endpoints again. The provider record must show `EXPORT_SUCCESS`, the consumer record must show `IMPORT_SUCCESS`, and each record must contain only the completion metadata. The direct receiver response is the evidence that the payload bypassed both connectors.

## Cleanup

```bash
docker compose down -v
```
