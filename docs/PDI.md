# Documentation
To interact with the PDI, you can use a route to generate the PDI URL for display inside an iframe.

```json
 GET /private/pdi
```
>You need to be authenticated to use this route

The parameters for this route are :
- `userId`: **required** (<small>string</small>)
- `privacyNoticeId`: **optional** (<small>string</small>)
### Flows

#### 1. User Authentication and Viewing All Exchanges

When only `userId` is provided in the parameters, the user will authenticate and see all their available exchanges.

**Example of Request:**

```http
GET https://your-connector-url/private/pdi?userId=65646d4320ec42ff2e719706
```

**Example of Response:**
```json
{
  "timestamp": 1717406701204,
  "code": 200,
  "content": {
    "url": "https://consent-url/v1/consents/pdi/iframe?userIdentifier=65e9bf306f36b34319ef062c&participant=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWU5ZWZhNzc2M2EzNTU4MzI3NGRlYzUiLCJwYXJ0aWNpcGFudF9uYW1lIjoicGFydGljaXBhbnRUd28iLCJpYXQiOjE3MTc0MDY3MDEsImV4cCI6MTcxNzQxMDMwMX0.9Ij81mw0ZTdjcT3T8u_WDZZuxKFjJMm-OywIkBOEIho"
  }
}
```

#### 2. User Authentication and Landing on Exchange Frame
When both userId and privacyNoticeId are provided, the user will authenticate and land on the exchange frame.

**Example of Request:**

```http
GET https://your-connector-url/private/pdi?userId=65646d4320ec42ff2e719706&privacyNoticeId=66438739aebbc58d5b6bfb68
```

**Example of Response:**
```json
{
  "timestamp": 1717406837192,
  "code": 200,
  "content": {
    "url": "http://consent-url/v1/consents/pdi/iframe?userIdentifier=65e9bf306f36b34319ef062c&participant=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWU5ZWZhNzc2M2EzNTU4MzI3NGRlYzUiLCJwYXJ0aWNpcGFudF9uYW1lIjoicGFydGljaXBhbnRUd28iLCJpYXQiOjE3MTc0MDY4MzcsImV4cCI6MTcxNzQxMDQzN30.JF-BvIccoTYnIitfhcivgnrlL5B81xQRrXD8oNSt2l0&privacyNoticeId=6617ac91dcc9a52416ab08b9"
  }
}
```

### Displaying the URL in an iframe


You can display this url in an iframe
```html
<iframe src="http://consent-url/v1/consents/pdi/iframe?userIdentifier=65e9bf306f36b34319ef062c&participant=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWU5ZWZhNzc2M2EzNTU4MzI3NGRlYzUiLCJwYXJ0aWNpcGFudF9uYW1lIjoicGFydGljaXBhbnRUd28iLCJpYXQiOjE3MTc0MDY4MzcsImV4cCI6MTcxNzQxMDQzN30.JF-BvIccoTYnIitfhcivgnrlL5B81xQRrXD8oNSt2l0&privacyNoticeId=6617ac91dcc9a52416ab08b9"></iframe>
```

### Result Displayed
![User Auth step](./images/pdi-1.png)
![Exchanges step](./images/pdi-2.png)
![Privacy Notices step](./images/pdi-3.png)
![Privacy Notice step](./images/pdi-4.png)
![End step](./images/pdi-5.png)