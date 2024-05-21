# How to trigger a B2B data exchange through the API connector
You can trigger a data exchange when you are consumer through your connector with the API route
```json
{your_connetor_url}/consumer/exchange
```
The request body parameters are the following
```json
{
  // Provider connector endpoint
  // required
  "providerEndpoint": "https://provider.connector.com/",
  // Self Description of the contract where the exchange is based
  // required
  "contract": "https://contract.com/contracts/id",
  // Consumer service offering self description
  // optional
  "purposeId": "https://catalog.api.com/v1/catalog/serviceofferings/id",
  // Provider service offering self description
  // optional
  "resourceId": "https://catalog.api.com/v1/catalog/serviceofferings/id"
}
```

## Bilateral contract

In case of a bilateral contract the needed payload need only the contract
```json
{
  "contract": "https://contract.com/contracts/id"
}
```

## Data use case contract
In case of a data use case contract all the params are required

```json
{
  "providerEndpoint": "https://provider.connector.com/",
  "contract": "https://contract.com/contracts/id",
  "purposeId": "https://catalog.api.com/v1/catalog/serviceofferings/id",
  "resourceId": "https://catalog.api.com/v1/catalog/serviceofferings/id"
}
```
