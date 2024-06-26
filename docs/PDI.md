# Personal Data Intermediary

>For an overview on what the Personal Data Intermediary for user management, please refer to [the PDI section in the User Management documentation](./USER_MANAGEMENT.md#the-personal-data-intermediary).

To interact with the PDI, the connector offers a route to generate the PDI URL to be displayed inside an iframe.

```json
 GET /private/pdi
```
>You need to be authenticated to use this route

The query parameters for this route are :
- `userId`: **required** (<small>string</small>)
- `privacyNoticeId`: **optional** (<small>string</small>)
### Flows

#### 1. User Authentication and Viewing All Exchanges

If `userId` is the only provided parameter, the user will need to authenticate and will then see all of the available exchanges for him.

**Example Request:**

```http
GET https://your-connector-url/private/pdi?userId=65646d4320ec42ff2e719706
```

**Example Response:**
```json
{
  "timestamp": 1717406701204,
  "code": 200,
  "content": {
    "url": "https://consent-url/v1/consents/pdi/iframe?userIdentifier=65e9bf306f36b34319ef062c&participant=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWU5ZWZhNzc2M2EzNTU4MzI3NGRlYzUiLCJwYXJ0aWNpcGFudF9uYW1lIjoicGFydGljaXBhbnRUd28iLCJpYXQiOjE3MTc0MDY3MDEsImV4cCI6MTcxNzQxMDMwMX0.9Ij81mw0ZTdjcT3T8u_WDZZuxKFjJMm-OywIkBOEIho"
  }
}
```

#### 2. User Authentication and Landing on Exchange Iframe
When both userId and privacyNoticeId are provided, the user will authenticate and land on the specific data exchange iframe targeted by the privacy notice selected.

**Example Request:**

```http
GET https://your-connector-url/private/pdi?userId=65646d4320ec42ff2e719706&privacyNoticeId=66438739aebbc58d5b6bfb68
```

**Example Response:**
```json
{
  "timestamp": 1717406837192,
  "code": 200,
  "content": {
    "url": "http://consent-url/v1/consents/pdi/iframe?userIdentifier=65e9bf306f36b34319ef062c&participant=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWU5ZWZhNzc2M2EzNTU4MzI3NGRlYzUiLCJwYXJ0aWNpcGFudF9uYW1lIjoicGFydGljaXBhbnRUd28iLCJpYXQiOjE3MTc0MDY4MzcsImV4cCI6MTcxNzQxMDQzN30.JF-BvIccoTYnIitfhcivgnrlL5B81xQRrXD8oNSt2l0&privacyNoticeId=6617ac91dcc9a52416ab08b9"
  }
}
```

>In both cases, the response body is the same. This is because in all cases, the only differences lie in the actions the individual can take within the iframe of his PDI. What can be controlled by the participant is whether to propose a specific exchange (case 2) or the liberty of selecting the data exchange out of all possible exchanges (case 1).

### Displaying the iframe


It is then possible to display the iframe in any frontend application using:
```html
<iframe src="http://consent-url/v1/consents/pdi/iframe?userIdentifier=65e9bf306f36b34319ef062c&participant=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWU5ZWZhNzc2M2EzNTU4MzI3NGRlYzUiLCJwYXJ0aWNpcGFudF9uYW1lIjoicGFydGljaXBhbnRUd28iLCJpYXQiOjE3MTc0MDY4MzcsImV4cCI6MTcxNzQxMDQzN30.JF-BvIccoTYnIitfhcivgnrlL5B81xQRrXD8oNSt2l0&privacyNoticeId=6617ac91dcc9a52416ab08b9"></iframe>
```

### Example Result Displayed

>The following screens are an example PDI implementation from VisionsTrust

![User Auth step](./images/pdi-1.png)
![Exchanges step](./images/pdi-2.png)
![Privacy Notices step](./images/pdi-3.png)
![Privacy Notice step](./images/pdi-4.png)
![End step](./images/pdi-5.png)