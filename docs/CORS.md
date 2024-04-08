# CORS configuration

The CORS configurations, are origin endpoints stored in the data space connector configuration to allow a dynamic CORS security on routes who interact with a PDI Consent Modal.

This enables PDI consent modal components to communicate securely with your connector.

> **Note:**
>
> A PDI consent modal is a consent screen implementation or component facilitated by a PDI. As an example, [VisionsTrust proposes an implementation of a consent-modal web component](https://github.com/VisionsOfficial/pdi-consent-modal.git).

## Adding a new CORS Config

> **Note**  
> The routes are protected and require authentication.


You can add a new CORS configuration via the route : 

``
POST /private/configuration/cors
``

Which needs the string/uri corresponding to the origin where the request will come from in the payload :

```json
{
  "origin": "https://your-url.com"
}
```

In response, you get your configuration with your newly origin added in the  **modalOrigins** array of your connector configuration settings:

```json
{
  "timestamp": 1712567519048,
  "code": 200,
  "content": {
    "_id": "660e762295fe0972aaac11a2",
    "appKey": "uz9Mur29N4UuSJVODC5XSzSCxWECMV3Oerj6OejpMrUrqcsDRpSSC17O4DFNPTskMo47Tr0Gw4pUup2tEjVdNm5zQm30vErSQBRu",
    "serviceKey": "yHq2975cq3ddg01rZWozvVEe5bRdz0eSkUBhuaN0xdH7HUPuHwoz9BoHZz2WK9AuAXoNU9ZWe9jPPOF0xwQf0PZ0NWFaZVw4f5Wv",
    "secretKey": "YUrQnu4gJGsy9u8OkoMQJ1YSZT4VKhkX3T6Mow4gbqchWKe7t4rV0GqDcShCkc29tMFcSeBx71yubgGhyJTYR4d6zMp3PEkt69Xj",
    "endpoint": "http://your-pdc-endpoint/",
    "catalogUri": "https://catalog-uri/v1/",
    "contractUri": "http://contract-uri/",
    "consentUri": "http://consent-uri/v1/",
    "modalOrigins": [
      {
        "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlS2V5IjoiMXRBVGlLN0UzQTFIM2Rfd0lpVVhPdExDS2tXWlpLQV9wMlgwZ3drRG1GeHBmQ0Y0STNJc2xyZG1rUERfMzhhVFRyQXpJUVVMaXhVV2NCSWxCRnlCY3lVOHN4RFJVWk1YX09UYyIsIm9yaWdpbiI6Imh0dHBzOi8veW91ci11cmwuY29tIiwiaWF0IjoxNzEyNTY3NTE5MDQ1fQ.FM1B52WjFeO_dhIi5UxZx6n6pMiDJkmbjwmTwAiXmZI",
        "origin": "https://your-url.com",
        "_id": "6613b4df987dc5130bcf3294"
      }
    ],
    "__v": 4
  }
}
```
A JWT token is generated for each origin so that a connector can manage multiple origins where to load and use PDI consent modal components.

## Deleting a CORS configuration

You can delete the CORS configurations with its **id** :

``
DELETE /private/configuration/cors/:id
``

In response, you will find your configurations with the deleted CORS configuration

```json
{
  "timestamp": 1712567853201,
  "code": 200,
  "content": {
    "_id": "660e762295fe0972aaac11a2",
    "appKey": "uz9Mur29N4UuSJVODC5XSzSCxWECMV3Oerj6OejpMrUrqcsDRpSSC17O4DFNPTskMo47Tr0Gw4pUup2tEjVdNm5zQm30vErSQBRu",
    "serviceKey": "yHq2975cq3ddg01rZWozvVEe5bRdz0eSkUBhuaN0xdH7HUPuHwoz9BoHZz2WK9AuAXoNU9ZWe9jPPOF0xwQf0PZ0NWFaZVw4f5Wv",
    "secretKey": "YUrQnu4gJGsy9u8OkoMQJ1YSZT4VKhkX3T6Mow4gbqchWKe7t4rV0GqDcShCkc29tMFcSeBx71yubgGhyJTYR4d6zMp3PEkt69Xj",
    "endpoint": "http://your-pdc-endpoint/",
    "catalogUri": "https://catalog-uri/v1/",
    "contractUri": "http://contract-uri/",
    "consentUri": "http://consent-uri/v1/",
    "modalOrigins": [],
    "__v": 4
  }
}
```

## Retrieving CORS configurations

You can retrieve the CORS configurations in response of the two previously routes or by retrieving your configuration :

```
GET /private/configuration/
```

## Prerequisites 

The PDI Consent Modal communicates with the connector through the following PDI routes.

```
GET /private/pdi/exchanges/:as
```

```
GET /private/pdi/:userId/privacy-notices/:privacyNoticeId
```

To allow the use of these routes, it is important to add the origin and JWT token in the headers of the requests to ensure that the CORS configuration is properly picked up and verified by the connector.

```json
{
  "headers": {
      "origin": "https://your-url.com",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlS2V5IjoiMXRBVGlLN0UzQTFIM2Rfd0lpVVhPdExDS2tXWlpLQV9wMlgwZ3drRG1GeHBmQ0Y0STNJc2xyZG1rUERfMzhhVFRyQXpJUVVMaXhVV2NCSWxCRnlCY3lVOHN4RFJVWk1YX09UYyIsIm9yaWdpbiI6Imh0dHBzOi8veW91ci11cmwuY29tIiwiaWF0IjoxNzEyNTY3NTE5MDQ1fQ.FM1B52WjFeO_dhIi5UxZx6n6pMiDJkmbjwmTwAiXmZI"
  }
}
```

> **Note**
> - The CORS configuration only work with DNS
> - Watch out for the origin string's typo, it's best not to end with a backslash