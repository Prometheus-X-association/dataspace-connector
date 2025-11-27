# Supported Mime Type by the REST flow

The REST flow supports various MIME types for data exchange between connectors and resources. This document outlines the supported MIME types, their descriptions, and the flows in which they are applicable.

## Limit size

Currently, the maximum size for the different mimes types are configurable through the following config variables:
* expressLimitSize

The size is common to all mime types and defaults to `2mb` if not specified.

## Configuration

To use a specific MIME type in the REST flow, you can configure it in the resource from the catalog. Navigate to the resource settings and specify the desired MIME type.

## Default management

By default, during the exchange if no MIME type is specified, the system will use `application/json` as the default MIME type for data exchange.

This ensures compatibility and ease of integration across different connectors and resources.

If the resource does not support `application/json`, the system will stop the exchange if the checksum, content length and content type are not aligned.

## Supported Mime Types

The following table lists the supported MIME types along with their descriptions:

| MIME Type                | Description                       | Flow                             |
|--------------------------|-----------------------------------|----------------------------------|
| application/json         | JavaScript Object Notation (JSON) | service chain, standard, consent |
| application/pdf          | Portable Document Format (PDF)    | standard                         |
| application/octet-stream | Binaries  (BIN)                   | standard                         |
| text/csv                 | Comma-Separated Values (CSV)      | standard                         |

## Expected requests format from connector to resource

As a consumer your connector should send the requests in the following format during an exchange at your resource url:

* For JSON data: `application/json`

Header:
```json
{
  
}
```

Body
```json
{
  
}
```
* for PDF data: `application/pdf`

  Header:
```json
{
  
}
```

Body
```json
{

}
```

* for CSV data: `text/csv`

  Header:
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "text/csv",
  "x-ptx-incomingdataspaceconnectoruri": "http://host.docker.internal:3334/",
  "x-ptx-dataexchangeid": "69284e56d18bf784ee2c1427",
  "x-ptx-contractid": "691f16068c05c88700ea118e",
  "x-ptx-contracturl": "http://host.docker.internal:8888/contracts/691f16068c05c88700ea118e",
  "user-agent": "axios/1.7.2",
  "content-length": "9800",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "localhost:3321",
  "connection": "keep-alive"
}
```

Body
```json
{

}
```

* for BIN data: `application/octet-stream`

## Expected requests format from connector to connector

During the exchange between connectors, the provider connector will send the data in the format specified by the consumer connector.
* For JSON data: `application/json`
  Header:
```json
{
  
}
```
Body
```json
{
  
}
```
* for PDF data: `application/pdf`
* for CSV data: `text/csv`
* for BIN data: `application/octet-stream`