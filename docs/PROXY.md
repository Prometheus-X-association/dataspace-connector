# Proxy

The connector manage proxy settings to allow connections through a proxy server if required for resource.

## Configuring Proxy Settings on resource

The configuration is made in the catalog on the resource settings. You can specify the following parameters:
* **Proxy Host**: The hostname or IP address of the proxy server.
* **Proxy Port**: The port number on which the proxy server is listening.
* **Proxy Credential**: (Optional) The credential id registered on your connector.

## Credential for Proxy Authentication

If your proxy server requires authentication, you can create a credential in your connector with the necessary username and password. Then, reference this credential in the resource settings under "Credential".

## Example
Here is an example of how to configure the credential to be correctly used by the proxy as username and password

POST `/private/credential`

```json
{
  "type": "proxy",
  "key": "your-proxy-username",
  "value": "your-proxy-password"
}
```

response:

```json
{
  "timestamp": 1764249993506,
  "code": 201,
  "content": {
    "_id": "69285189d18bf784ee2c1435",
    "key": "your-proxy-username",
    "value": "your-proxy-password",
    "type": "proxy",
    "__v": 0
  }
}
```

Then, in the resource settings, you can specify the _id of the created credential.