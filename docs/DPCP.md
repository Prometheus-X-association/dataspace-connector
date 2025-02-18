# Data Processing Chain Protocol

The data processing chain inside the connector is based on the data processings configured in dataspace use case contracts and the use of the [DPCP library](https://github.com/prometheus-x-association/data-processing-chain-protocol).

## Exchange

### How to Use

To use a data processing chain during an exchange, you can add the ID of the chain from the contract into the route `/consumer/exchange` by adding the `dataProcessingId` field which should match the ID of the chain that has been created for a contract.

```json
{
  "contract": "http://contract:8081/contracts/66db1a6dc29e3ba863a85e0f",
  "purposeId": "http://catalog:8082/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb0",
  "resourceId": "http://catalog:8082/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca",
  "dataProcessingId": "670e8eb6b439a2379f290fc7"
}
```

> IMPORTANT
>
> The dataProcessing needs to exist in the contract or consent to be used

### How to retrieve the `dataProcessingId`

The dataProcessingId refers to the `catalogId`, that you will find inside the field `dataProcessings` or `recipientThirdParties`, depending on whether it is a contract or a consent.

#### Contract

To retrieve a contract, you can refer to the [Data Exchange documentation file](./DATA_EXCHANGE.md#how-to-retrieve-your-contracts).

expected output :

```jsonc
{
  "_id": "670e8eb6b439a2379f290fc6",
  // others fiels
  "dataProcessings": [
    {
      "catalogId": "670e8eb6b439a2379f290fc1", // The dataProcessingId
      "infrastructureServices": [
        {
          "participant": "https://api.catalog.com/v1/catalog/participants/66d18724ee71f9f096bae810",
          "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/672c89cb870a096712ca4d59",
          "_id": "674981ed70a7d9606bb2ed43"
        },
        {
          "participant": "https://api.catalog.com/v1/catalog/participants/66d18a1dee71f9f096baec07",
          "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/672c8e77870a096712ca7676",
          "_id": "674981ed70a7d9606bb2ed44"
        },
        {
          "participant": "https://api.catalog.com/v1/catalog/participants/66d18a1dee71f9f096baec08",
          "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7",
          "_id": "674981ed70a7d9606bb2ed45"
        }
      ],
      "status": "active",
      "_id": "674981ed70a7d9606bb2ed42"
    },
    {
      "catalogId": "670e8eb6b439a2379f290fc2", // The dataProcessingId
      "infrastructureServices": [
        {
          "participant": "https://api.catalog.com/v1/catalog/participants/66d18724ee71f9f096bae810",
          "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/672c89cb870a096712ca4d59",
          "_id": "674981ed70a7d9606bb2ed47"
        },
        {
          "participant": "https://api.catalog.com/v1/catalog/participants/66d18a1dee71f9f096baec07",
          "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/672c8dbf870a096712ca74fd",
          "_id": "674981ed70a7d9606bb2ed48"
        },
        {
          "participant": "https://api.catalog.com/v1/catalog/participants/66d18a1dee71f9f096baec08",
          "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7",
          "_id": "674981ed70a7d9606bb2ed49"
        }
      ],
      "status": "active",
      "_id": "674981ed70a7d9606bb2ed46"
    }
  ]
}
```

#### Consent

For information on the endpoints handling consent in your connector, refer to the [swagger](./swagger.json) documentation.

expected privacy notice output:

```jsonc
{
  "_id": "6734ceb9b36f3b579c92854f",
  // other fields
  "dataProcessings": [
    {
      "status": "active",
      "catalogId": "670e8eb6b439a2379f290fc7", // The dataProcessingId
      "infrastructureServices": [
        {
          "_id": "6734ce54524aaf1488398f84",
          "participant": "https://api.catalog.com/v1/catalog/participants/66d18724ee71f9f096bae810",
          "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca"
        },
        {
          "_id": "6734ce54524aaf1488398f85",
          "participant": "https://api.catalog.com/v1/catalog/participants/66d18a1dee71f9f096baec07",
          "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb7",
          "params": {
            "custom": "custom"
          },
          "configuration": "671a73867bb2447c8085d96f"
        },
        {
          "_id": "6734ce54524aaf1488398f86",
          "participant": "https://api.catalog.com/v1/catalog/participants/66d18a1dee71f9f096baec08",
          "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb1",
          "params": {
            "custom": "custom"
          },
          "configuration": "6720a0249cb2e866c196c10f"
        }
      ]
    }
  ]
}
```

expected consent output :

```jsonc
{
  "record": {
    "schemaVersion": "0.2.0",
    "recordId": "67365aa390089d27f1506887",
    "piiPrincipalId": "660fff4528678b2683bab15f"
  },
  "piiProcessing": {
    "privacyNotice": "6734ce6eb36f3b579c928548",
    // other fields
    "purposes": [
      {
        // other fields
        "recipientThirdParties": [
          {
            "caatalogId": "670e8eb6b439a2379f290fc1", // the dataProcessingId
            "infrastructureServices": [
              {
                "participant": "https://api.catalog.com/v1/catalog/participants/66d18724ee71f9f096bae810",
                "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/672c89cb870a096712ca4d59",
                "_id": "67365aa390089d27f1506888"
              },
              {
                "participant": "https://api.catalog.com/v1/catalog/participants/66d18a1dee71f9f096baec07",
                "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/672c8e77870a096712ca7676",
                "_id": "67365aa390089d27f1506889"
              },
              {
                "participant": "https://api.catalog.com/v1/catalog/participants/66d18a1dee71f9f096baec08",
                "serviceOffering": "https://api.catalog.com/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7",
                "_id": "67365aa390089d27f150688a"
              }
            ]
          }
        ],
      }
    ]
  },
  // other fields
}
```

## Infrastructure Configuration

The Infrastructure Configuration is an optional configuration that can be use by the connector during the exchange to provide more customizable actions when the connector interacts with the representation. For now, the Infrastructure configuration Id needq to be set up in the catalog on the infrastructure service as the `configuration field`.

Infrastructure configuration endpoints are provided to manage data processing configurations:

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

> Deleting the infrastructure configuration while it is still referenced in the catalog on the infrastructure service may result in errors if the corresponding field is not updated.

### Response Format

All endpoints return responses in the following format:

```jsonc
{
  "timestamp": 1234567890,
  "code": 200,
  "content": {
    // Response data
  }
}
```

### Authentication

All infrastructure configuration endpoints require authentication using JWT tokens, which can be retrieved by logging into the connector using the `/login` route. Include the token in the Authorization header:

```json
"Authorization": "Bearer <your_jwt_token>"
```

### How to use

This ID can be utilized in the catalog during the creation of the infrastructure service.
Upon addition, this configuration will be employed by the connector for each exchange configured with this ID.
