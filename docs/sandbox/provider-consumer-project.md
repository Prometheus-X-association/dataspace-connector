# Data Processing Chain Protocol Exchange inside a project example steps

This guide demonstrates how to test a complete DPCP exchange flow within a project using the sandbox environment.

## Prerequisites

- Sandbox environment is up and running
- All services are healthy (check with `docker ps`)
- You have access to the /docs url of the connectors or a REST client (like Postman or cURL)

## Login

1. Get Provider token:

```bash
curl -X POST http://localhost:3010/login \
  -H "Content-Type: application/json" \
  -d '{"serviceKey": "MLLgUPxnnZLxOAu5tbl_p9Bx_GKJFWJLVkic4jHOirGJjD_6zEbzcCosAhCw7zV_VA9fPYy_vdRkZLuebUAUoQgjAPZGPuI9zaXg",
  "secretKey": "xxRfHgwyb8OGYVuvdn13fwa8glsaFFwzB12laHzqoPs0PFw7HcA1DP6X8wkqEfZ4feUTwfdXO9WHGzlPwstMrE4FJVllcIl5U4nG"}'
```

2. Get Consumer token:

```bash
curl -X POST http://localhost:3030/login \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "Qh4XvuhSJbOp8nMV1JtibAUqjp3w_efBeFUfCmqQW_Nl8x4t3Sk6fWiK5L05CB3jhKZOgY5JlBSvWkFBHH_6fFhYQZWXNoZxO78x",
  "serviceKey": "dWJUUKH9rYF9wr_UAPb6PQXW9h17G7dzuGCbiDhcyjCGgHzLwBp6QHOQhDg0FFxS24GD8nvw37oe_LOjl7ztNATYiVOd_ZEVHQpV"}'

3. Get Infrastructure token:

```bash
curl -X POST http://localhost:3020/login \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "Qh4XvuhSJbOp8nMV1JtibAUqjp3w_efBeFUfCmqQW_Nl8x4t3Sk6fWiK5L05CB3jhKZOgY5JlBSvWkFBHH_6fFhYQZWXNoZxO78w",
  "serviceKey": "dWJUUKH9rYF9wr_UAPb6PQXW9h17G7dzuGCbiDhcyjCGgHzLwBp6QHOQhDg0FFxS24GD8nvw37oe_LOjl7ztNATYiVOd_ZEVHQpT"}'
```

expected response example: 

```json
{
  "timestamp": 1730904960057,
  "code": 200,
  "content": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlS2V5IjoiTUxMZ1VQeG5uWkx4T0F1NXRibF9wOUJ4X0dLSkZXSkxWa2ljNGpIT2lyR0pqRF82ekViemNDb3NBaEN3N3pWX1ZBOWZQWXlfdmRSa1pMdWViVUFVb1FnakFQWkdQdUk5emFYZyIsImlhdCI6MTczMDkwNDk2MDA1NSwiZXhwIjoxNzMwOTA0OTYwMzU1fQ.HvoHfXFy0L9Qtdl3pm-OSxH9phal_Vlc2_gYpiWJboM",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlS2V5IjoiTUxMZ1VQeG5uWkx4T0F1NXRibF9wOUJ4X0dLSkZXSkxWa2ljNGpIT2lyR0pqRF82ekViemNDb3NBaEN3N3pWX1ZBOWZQWXlfdmRSa1pMdWViVUFVb1FnakFQWkdQdUk5emFYZyIsImlhdCI6MTczMDkwNDk2MDA1NiwiZXhwIjoxNzMwOTA0OTYwMzU2fQ.la9FDMlOICL1TXQOQSZ-YRLHib1GO3iQskXDk_4sE7w"
  }
}
```

Save these tokens for subsequent requests.

## Trigger the exchange

1. Initiate data exchange (from Consumer):

```bash
curl -X POST http://localhost:3030/consumer/exchange \
  -H "Authorization: Bearer {consumer_token}" \
  -H "Content-Type: application/json" \
  -d '{
  "contract": "http://contract:8081/contracts/66db1a6dc29e3ba863a85e0f",
  "purposeId": "http://catalog:8082/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb1",
  "resourceId": "http://catalog:8082/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca"
}
'
```

2. Initiate data exchange (from Provider):

```bash
curl -X POST http://localhost:3010/consumer/exchange \
  -H "Authorization: Bearer {provider_token}" \
  -H "Content-Type: application/json" \
  -d '{
  "contract": "http://contract:8081/contracts/66db1a6dc29e3ba863a85e0f",
  "purposeId": "http://catalog:8082/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb1",
  "resourceId": "http://catalog:8082/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca"
}
'
```

## Monitor

1. Check exchange status (from Consumer):

```bash
curl -X GET http://localhost:3030/dataexchanges
```

```bash
curl -X GET http://localhost:3010/dataexchanges
```

```bash
curl -X GET http://localhost:3020/dataexchanges
```

2. View Containers logs:

```bash
docker logs consumer
```

```bash
docker logs provider
```

```bash
docker logs infrastructure
```

## Expected Results

1. dataExchange:
   - should be created and synchronize on all connector
   - Status should progress through: "PENDING" -> "IMPORT_SUCCESS"
   - Status of the data processing should progress through: "completed: false" -> "completed: true"

## Troubleshooting

Common issues:

1. **Exchange Fails**
   - Verify all services are up
   - Check network connectivity
   - Ensure all tokens are valid
   - Review logs for detailed error messages

## Swagger

💡 **All these operations can be executed through the Swagger UI**

Each connector provides a comprehensive Swagger documentation interface accessible at its `/docs` endpoint:

- Provider Swagger UI: `http://localhost:3010/docs`
- Consumer Swagger UI: `http://localhost:3030/docs`
- Infrastructure Swagger UI: `http://localhost:3020/docs`
