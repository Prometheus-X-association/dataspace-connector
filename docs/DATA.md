# DATA FIELD IN CONSENT
To provide users with the ability to choose which data can be exchanged between participants in a consent, there is an optional field **data** in the body of the route for granting consent.
## How to use it
When retrieving privacy notices using the route _/private/consent/{userId}/{providerSd}/{consumerSd}_, there exists a field **data** which is an array of objects.
```json
{
      "_id": "6617f935dcc9a52416ab0b76",
      // other fields
      "data": [
        {
          "resource": "http://catalog.uri/v1/catalog/dataresources/65e71e4174f9e9026bd5dc41",
          "serviceOffering": "http://catalog.uri/v1/catalog/serviceofferings/65e71e5474f9e9026bd5dc51",
          "_id": "6617f935dcc9a52416ab0b78"
        },
        {
          "resource": "http://catalog.uri/v1/catalog/dataresources/65e7383974f9e9026bd5ee6c",
          "serviceOffering": "http://catalog.uri/v1/catalog/serviceofferings/65e71e5474f9e9026bd5dc51",
          "_id": "6617f2badcc9a52416ab0b27"
        }
      ]
}
```

When populating via the route _/private/consent/{userId}/privacy-notices/{privacyNoticeId}_, the resource can be found within the populated object.
```json
{
  "timestamp": 1712828877864,
  "code": 200,
  "content": {
    "_id": "6617ac91dcc9a52416ab08b9",
    // other fields
    "purposes": [
      {
        "@context": "http://host.docker.internal:4040/v1/softwareresource",
        "@type": "SoftwareResource",
        "_id": "65e71e9674f9e9026bd5dd3d",
        // other fields
        "resource": "http://host.docker.internal:4040/v1/catalog/softwareresources/65e71e9674f9e9026bd5dd3d"
      }
    ],
    "data": [
      {
        "@context": "http://catalog.uri/v1/dataresource",
        "@type": "DataResource",
        "_id": "65e7383974f9e9026bd5ee6c",
        //other fields
        "resource": "http://catalog.uri/v1/catalog/dataresources/65e7383974f9e9026bd5ee6c"
      },
      {
        "@context": "http://catalog.uri:4040/v1/dataresource",
        "@type": "DataResource",
        "_id": "65e71e4174f9e9026bd5dc41",
        //other fields
        "resource": "http://catalog.uri/v1/catalog/dataresources/65e71e4174f9e9026bd5dc41"
      }
    ]
  }
}
```

When a user wishes to give consent using the route _/private/consent/{userId}/{providerSd}/{consumerSd}_, they can select the desired data by simply sending the resource that corresponds to the self-description of the data resource within the data body field.
```json
{
  "privacyNoticeId": "6617f935dcc9a52416ab0b76",
  "userId": "65646d4320ec42ff2e719706",
  "data": [
    "http://catalog.uri/v1/catalog/dataresources/65e7383974f9e9026bd5ee6c"
  ]
}
```

>The data field is optional; if it is not provided or empty, **all** the data will be used for the data exchange.