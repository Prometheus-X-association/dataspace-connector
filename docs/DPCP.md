# Data Processing Chain Protocol

The data processing inside the connector is based on the data processing from the contract and the use of the dpcp library.

## Exchange

### How to Use

To use a data processing chain during an exchange, you can add the ID of the chain from the contract into the route `/consumer/exchange` by adding the body parameters `dataProcessingId`.

```json
{
  "contract": "http://contract:8081/contracts/66db1a6dc29e3ba863a85e0f",
  "purposeId": "http://catalog:8082/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb0",
  "resourceId": "http://catalog:8082/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca",
  "dataProcessingId": "670e8eb6b439a2379f290fc7"
}
```

> The dataProcessing need to exist in the contract to be used

## Infrastructure Configuration

The infrastructure provides endpoints to manage data processing configurations:

### Private Endpoints (Requires Authentication)

#### GET `/private/infrastructure/configurations`

Retrieves all infrastructure configurations.

#### GET `/private/infrastructure/configurations/{id}`

Retrieves a specific infrastructure configuration by ID.

#### POST `/private/infrastructure/configurations`

Creates a new infrastructure configuration.

Request body:

```json
{
  "verb": "GET",
  "data": "string",
  "infrastructureService": "string",
  "resource": "string"
}
```

Required fields:

- `verb`: The HTTP verb of the infrastructure configuration (e.g., "GET")
- `data`: Which data is needed
- `infrastructureService`: The infrastructure service URL
- `resource`: The target resource URL

#### PUT `/private/infrastructure/configurations/{id}`

Updates an existing infrastructure configuration.

Request body:

```json
{
  "verb": "GET",
  "data": "boolean",
  "infrastructureService": "string",
  "resource": "string"
}
```

Optional fields:

- `verb`: The HTTP verb to update
- `data`: Updated data requirement
- `infrastructureService`: Updated service URL
- `resource`: Updated target resource URL

#### DELETE `/private/infrastructure/configurations/{id}`

Deletes an infrastructure configuration by ID.

### Response Format

All endpoints return responses in the following format:

```json
{
  "timestamp": 1234567890,
  "code": 200,
  "content": {
    // Response data
  }
}
```

### Authentication

All infrastructure configuration endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```json
"Authorization": "Bearer <your_jwt_token>"
```

### How to use

This ID can be utilized in the catalog during the creation of the infrastructure service.
Upon addition, this configuration will be employed by the connector for each exchange configured with this ID.
