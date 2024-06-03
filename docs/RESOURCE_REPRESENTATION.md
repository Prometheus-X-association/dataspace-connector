# Resource Representation

In [data exchange flows](./DATA_EXCHANGE.md), the data space connector should be able to communicate with the participant's application or data source to push or pull a specific resource under certain conditions. Resource representations are the information that allow just that. It is an extension to the Data / Software resource data model composing a participant's offering catalogue and it contains the needed metadata to allow the connector to know where and how to pull or push data from / to a participant application.

The catalogue allows to inform this metadata on the resources that are registered to the catalogue. This goes for both data resources and service resources.

## Resource representation for data

When specifying representation metadata for data resources, this is usually done by data providers to define how their own connector should access this specific resource. The catalogue allows to inform :
- The URL the connector should call to get the data
- What type of source it should be
- The [credentials](./CREDENTIALS.md) it should use to communicate with the data provider's application

## Resource representation for services

For service providers / data consumers, resource representation metadata should be informed for the proposed services on data processing they register in the catalogue. The configuration is very similar and the fields to inform are globally the same as for data representations. Some catalogues may ask for more or less information depending on the needs of the catalogue.

## Variables used in representation
In the URL of the representation, you can include variables enclosed in curly braces "{}". These variables will be interpreted by the connector and replaced at runtime with data from your user/userIdentifier.
### userId
Including {userId} in the URL will replace it with the identifier/internalID of your user (on the connector side) or userIdentifier (on the consent side) at runtime.
### url
Including {url} in the URL will replace it with the URL field added to your user (on the connector side) at runtime.
## Note

These configuration processes are to be done on the catalogue you are using and are not meant to be done within the connector itself. The only configuration needed from the connector on this part is the creation of the [credentials](./CREDENTIALS.md), which will generate an id to inform on the catalogue.

---
\>\> [Credentials](./CREDENTIALS.md)