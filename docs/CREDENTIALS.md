# Credentials

Credentials that are stored within the connector have a single usage, being to authenticate requests and communications made between the connector and your application during the data exchange processes.

For obvious security reasons, credentials to be used when exchanging one specific resource should not be registered to the catalogue. To fix this issue, the connector is able to generate credential key-value pairs which you can use for any kind of purpose:

-   A login (key) and a password (value)
-   An api header (key) and an api key (value)

The [resource representation](./RESOURCE_REPRESENTATION.md) that will be made on your resources will allow the connector to then know how to use that specific key-value, as you will be able to state if it is a basic authentication, an api-key, etc.

## Generating a new credential

When logged in as an administrator to the connector you are able to generate new credentials.

```bash
POST /private/credentials
```

with the following payload

```json
{
    "type": "<string>",
    "key": "<string>",
    "value": "<string>"
}
```

This will store a new credential configuration inside of the config.json file of the connector and return a credential id that can then be informed in the [resource representation](./RESOURCE_REPRESENTATION.md) of your resource on the catalogue.

## Managing credentials

Just as you can create a credential configuration, you can easily manage your existing credentials.

#### Getting the list of credentials

```
GET /private/credentials
```

```
GET /private/credentials/{id}
```

#### Updating

```
PUT /private/credentials/{id}
```

## Manual configuration of credentials

The other way of creating credentials is to manually edit the config.json file and alter the credentials array with the values you decide. This is not an automated process but enables you to use any kind of key-generation you want. The only consideration to keep in mind is to use the same structure for the credential as shown as an example in the [config.sample.json](../src/config.sample.json).

