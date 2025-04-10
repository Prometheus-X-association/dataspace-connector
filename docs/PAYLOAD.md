# Payload
During the different exchanges and stages of the exchange flow, some payloads will be received and need to be used.

Below are the different payloads received by the resource
## Service chain
### received as an Infrastructure Provider
```json
{
  "data": [
    {
      "_id": "65646d4320ec42ff2e719706",
      "email": "participant+1@email.com",
      "verified_email": true,
      "schema_version": "1",
      "createdAt": "2024-02-22T14:52:04.389Z",
      "updatedAt": "2024-07-15T09:50:29.883Z",
      "__v": 0,
      "skills": "[\"office suite\", \"windows\"]"
    },
    {
      "_id": "656473537815cf3703d26302",
      "email": "participant+2@email.com",
      "verified_email": true,
      "schema_version": "1",
      "createdAt": "2024-02-22T14:52:04.389Z",
      "updatedAt": "2024-05-30T09:34:11.163Z",
      "__v": 0,
      "skills": "[\"office suite\", \"windows\"]"
    }
  ],
  "contract": "https://staging.contract.visionstrust.com/contracts/67f3dc0a63abc4c89b80c161",
  "params": {
    "paramsFromChainSetupInCatalog": "something"
  }
}
```
### received as a Consumer
```json
{
  "data": [
    {
      "_id": "65646d4320ec42ff2e719706",
      "email": "participant+1@email.com",
      "verified_email": true,
      "schema_version": "1",
      "createdAt": "2024-02-22T14:52:04.389Z",
      "updatedAt": "2024-07-15T09:50:29.883Z",
      "__v": 0,
      "skills": "[\"office suite\", \"windows\"]"
    },
    {
      "_id": "656473537815cf3703d26302",
      "email": "participant+2@email.com",
      "verified_email": true,
      "schema_version": "1",
      "createdAt": "2024-02-22T14:52:04.389Z",
      "updatedAt": "2024-05-30T09:34:11.163Z",
      "__v": 0,
      "skills": "[\"office suite\", \"windows\"]"
    }
  ],
  "contract": "https://staging.contract.visionstrust.com/contracts/67f3dc0a63abc4c89b80c161",
  "params": {
    "paramsFromChainSetupInCatalog": "something"
  },
  "previousNodeParams": {
    "paramsFromPreviousNode": "something"
  }
}
```
### received after a pre node in a chain
```jsonc
{
  "data": {
    "additionalData": [ //data from the pre node
      {
        "participant": {
          "name": "Test-Infrastructure",
          "connectorUrl": "https://infra.pdc/",
          "id": "66d18a1dee71f9f096baec07"
        },
        "params": {
          "params1": "something"
        },
        "data": {
          "category": [
            "categoryA",
            "categoryB",
            "categoryC",
            "categoryD"
          ]
        }
      }
    ],
    "origin": [ // data coming from the provider
      {
        "_id": "65646d4320ec42ff2e719706",
        "email": "participant+1@email.com",
        "verified_email": true,
        "schema_version": "1",
        "createdAt": "2024-02-22T14:52:04.389Z",
        "updatedAt": "2024-07-15T09:50:29.883Z",
        "__v": 0,
        "skills": "[\"office suite\", \"windows\"]"
      },
      {
        "_id": "656473537815cf3703d26302",
        "email": "participant+2@email.com",
        "verified_email": true,
        "schema_version": "1",
        "createdAt": "2024-02-22T14:52:04.389Z",
        "updatedAt": "2024-05-30T09:34:11.163Z",
        "__v": 0,
        "skills": "[\"office suite\", \"windows\"]"
      }
    ]
  },
  "contract": "https://staging.contract.visionstrust.com/contracts/67f3dc0a63abc4c89b80c161",
  "params": {
    "paramsFromChainSetupInCatalog": "something"
  }
}
```
### send as an Infrastructure Provider
To continue a chain as an Infrastructure provider, a request POST is made on the endpoint `https://your-connector-url/node/communicate/resume` with the following payload
```jsonc
{
    "chainId": "@supervisor:67f66a90cc0846cc99ab840a-1744205299444-b236cf81",//x-ptx-service-chain-id header
    "targetId": "https://staging.visionstrust.com/v1/catalog/infrastructureservices/67f669b57b3045a9bb30e240", //x-ptx-target-id header
    "data": "your data"//object, array or string,
    "params": {
        "test": "params" //any number of key value pair
    }
}
```
### send as a pre provider
```jsonc
{
  "data": "your data"//object, array or string,
  "params": {
    "test": "params" //any number of key value pair
  }
}
```
# Headers

When the connector makes a request to your resource, you can retrieve information from the headers.

```jsonc
 {
  "accept": "application/json, text/plain, */*",
  "content-type": "application/json",
  //the chain Id
  "x-ptx-service-chain-id": "@supervisor:67f66a90cc0846cc99ab840a-1744205196870-1bcec18e",
  //next resource in the chain
  "x-ptx-service-chain-next-target": "https://staging.visionstrust.com/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb0",
  //current target resource
  "x-ptx-target-id": "https://staging.visionstrust.com/v1/catalog/infrastructureservices/67f669b57b3045a9bb30e240",
  //provider pdc URL
  "x-ptx-incomingdataspaceconnectoruri": "https://provider.pdc/",
  //dataExchangeId
  "x-ptx-dataexchangeid": "67f6758caed89eb179984140",
  //ContractId
  "x-ptx-contractid": "67f3dc0a63abc4c89b80c161",
  //contract URI
  "x-ptx-contracturl": "https://staging.contract.visionstrust.com/contracts/67f3dc0a63abc4c89b80c161",
  ...
}
```

## as a pre provider

```jsonc
 {
  "accept": "application/json, text/plain, */*",
  "x-ptx-service-chain-id": "@supervisor:67f3dd13b1686004c39605de-1744207642669-babcf65a",
  "x-ptx-service-chain-next-target": "https://staging.visionstrust.com/v1/catalog/serviceofferings/66d18b79ee71f9f096baecb0",
  "x-ptx-service-chain-next-node": "https://provider.pdc/",
  ...
}
```