# Data Processing Chain Protocol Exchange based on a consent

This guide demonstrates how to test a complete DPCP exchange, based on a consent, flow within a project using the sandbox environment.

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

excepted response : 

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

## See the available exchange (optional)

```bash
curl -X GET http://localhost:3010/private/consent/exchanges/provider \
  -H "Authorization: Bearer {provider_token}" \
  -H "Content-Type: application/json" \
'
```

## Get the privacy notices (optional)

```bash
curl -X GET http://localhost:3010/private/consent/65646d4320ec42ff2e719706/aHR0cDovL2NhdGFsb2c6ODA4Mi92MS9jYXRhbG9nL3BhcnRpY2lwYW50cy82NmQxODcyNGVlNzFmOWYwOTZiYWU4MTA%3D/aHR0cDovL2NhdGFsb2c6ODA4Mi92MS9jYXRhbG9nL3BhcnRpY2lwYW50cy82NmQxOGExZGVlNzFmOWYwOTZiYWVjMDg%3D \
  -H "Authorization: Bearer {provider_token}" \
  -H "Content-Type: application/json" \
'
```

## Get a privacy notice (optional)

```bash
curl -X GET http://localhost:3010/private/consent/65646d4320ec42ff2e719706/privacy-notices/6734ce6eb36f3b579c928548 \
  -H "Authorization: Bearer {provider_token}" \
  -H "Content-Type: application/json" \
'
```

## Trigger the exchange

```bash
curl -X POST http://localhost:3010/private/consent/?triggerDataExchange=true \
  -H "Authorization: Bearer {provider_token}" \
  -H "Content-Type: application/json" \
  -d '{
  "privacyNoticeId": "6734ce6eb36f3b579c928548",
  "userId": "65646d4320ec42ff2e719706",
  "dataProcessingId": "670e8eb6b439a2379f290fc1"
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

2. View Containers logs:

```bash
docker logs consumer
```

```bash
docker logs provider
```

## Expected Results

1. dataExchange:
   - should be created and synchronize on both side
   - Status should progress through: "PENDING" -> "IMPORT_SUCCESS"

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
