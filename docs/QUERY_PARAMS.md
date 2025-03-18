# Query params

When triggering a data exchange, it is possible to add specific query parameters that will be used in the exchange:

> Currently, the query parameters are only used when exporting data from the provider.

> Query parameters can be applied in any case of the consumer/exchange routes: using the <code>type</code>, <code>providerEndpoint</code>, or only the <code>contract</code> fields.

## Applying Query Parameters to All Provider Resources

```json
{
    "purposeId": "https://a-ptx-catalog.com/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb0",
    "resourceId": "https://a-ptx-catalog.com/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca",
    "contract": "https://a-ptx-contract-service.com/contracts/66db1a6dc29e3ba863a85e0f",
    "providerParams": {
        "query": [
            {
                "page": 2
            },
            {
                "limit": 20
            }
        ]
    }
}
```

By adding the <code>providerParams</code> field at the exchange, the query will be applied to all data resources of the provider during data export. The required format for the <code>providerParams</code> field is:

```jsonc
 {
  "query": [
    {
      "anyString": "anyValue"
    },
    {
      "anyString": "anyValue"
    }
    // add more...
  ]
}
```

## Applying Query Parameters to a Specific Resource

If you want to apply query parameters to only one resource, you can specify them in the <code>resources</code> field:

```json
{
    "purposeId": "https://a-ptx-catalog.com/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb0",
    "resourceId": "https://a-ptx-catalog.com/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca",
    "contract": "https://a-ptx-contract-service.com/contracts/66db1a6dc29e3ba863a85e0f",
    "resources": [
      {
        "resource": "https://a-ptx-catalog.com/v1/catalog/dataresources/66d1889cee71f9f096bae98b",
        "params": {
          "query": [
            {
              "page": 2
            },
            {
              "limit": 20
            }
          ]
        }
      }
    ]
}
```
In this case, the query parameters <code>page</code> and <code>limit</code> will be applied to the data resource <code>66d1889cee71f9f096bae98b</code>.

## Requirements

To allow the connector to apply query parameters, the resource representation must contain a <code>queryParams</code> field with the corresponding queries.

Example of a data resource:
```jsonc
 {
  "@context": "https://a-ptx-catalog.com/v1/dataresource",
  "@type": "DataResource",
  "_id": "66d1889cee71f9f096bae98b",
  "aggregationOf": [],
  "name": "Provider",
  "description": "provider",
  "copyrightOwnedBy": [],
  "license": [],
  "policy": [],
  "producedBy": "66d18724ee71f9f096bae810",
  "exposedThrough": [],
  "obsoleteDateTime": "",
  "expirationDateTime": "",
  "containsPII": false,
  "anonymized_extract": "",
  "archived": false,
  "attributes": [],
  "category": "6090ff950d9b6451c24ac0b0",
  "isPayloadForAPI": false,
  "country_or_region": "WORLD",
  "entries": 0,
  "subCategories": [],
  "schema_version": "1",
  "b2cDescription": [],
  "createdAt": "2024-08-30T08:53:48.891Z",
  "updatedAt": "2024-08-30T08:53:48.940Z",
  "__v": 0,
  "representation": {
    "_id": "66d1889cee71f9f096bae996",
    "resourceID": "66d1889cee71f9f096bae98b",
    "fileType": "",
    "type": "REST",
    "url": "https://provider.api.com/api/users",
    "sqlQuery": "",
    "className": "",
    "method": "none",
    "credential": null,
    "createdAt": "2024-08-30T08:53:48.945Z",
    "updatedAt": "2024-08-30T08:53:48.945Z",
    "__v": 0,
    "queryParams": [ "page", "limit", "skip" ] // required
  }
}
```

> In this example only the query parameters <code>page</code>, <code>limit</code>, and <code>skip</code> will be interpreted by the connector.

## Concrete example

I'm a Provider and my data resource is as follows:

```json
 {
  "@context": "https://a-ptx-catalog.com/v1/dataresource",
  "@type": "DataResource",
  "_id": "66d1889cee71f9f096bae98b",
  "aggregationOf": [],
  "name": "Provider",
  "description": "provider",
  "copyrightOwnedBy": [],
  "license": [],
  "policy": [],
  "producedBy": "66d18724ee71f9f096bae810",
  "exposedThrough": [],
  "obsoleteDateTime": "",
  "expirationDateTime": "",
  "containsPII": false,
  "anonymized_extract": "",
  "archived": false,
  "attributes": [],
  "category": "6090ff950d9b6451c24ac0b0",
  "isPayloadForAPI": false,
  "country_or_region": "WORLD",
  "entries": 0,
  "subCategories": [],
  "schema_version": "1",
  "b2cDescription": [],
  "createdAt": "2024-08-30T08:53:48.891Z",
  "updatedAt": "2024-08-30T08:53:48.940Z",
  "__v": 0,
  "representation": {
    "_id": "66d1889cee71f9f096bae996",
    "resourceID": "66d1889cee71f9f096bae98b",
    "fileType": "",
    "type": "REST",
    "url": "https://provider.api.com/api/users",
    "sqlQuery": "",
    "className": "",
    "method": "none",
    "credential": null,
    "createdAt": "2024-08-30T08:53:48.945Z",
    "updatedAt": "2024-08-30T08:53:48.945Z",
    "__v": 0,
    "queryParams": [ "page", "limit", "skip" ]
  }
}
```

When triggering the exchange, I will use the <code>/consumer/exchange</code> route on my connector with the following body:

```json
{
    "purposeId": "https://a-ptx-catalog.com/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb0",
    "resourceId": "https://a-ptx-catalog.com/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca",
    "contract": "https://a-ptx-contract-service.com/contracts/66db1a6dc29e3ba863a85e0f",
    "resources": [
      {
        "resource": "https://a-ptx-catalog.com/v1/catalog/dataresources/66d1889cee71f9f096bae98b",
        "params": {
          "query": [
            {
              "page": 2
            },
            {
              "limit": 20
            },
            {
              "skip": 10
            }
          ]
        }
      }
    ]
}
```

To retrieve the data, my connector will make an HTTP request to this endpoint:

```http request
https://provider.api.com/api/users?page=2&limit=20&skip=10
```