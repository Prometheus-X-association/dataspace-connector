# Data Exchange

The main purpose of the data space connector is to enable data exchange between participants of the data space. The connector can handle 2 types of data exchange flows:

-   Non-personal B2B data exchange, where the data exchange happens between two participants and does not involve personal data, individuals or user consent.
-   Personal data exchange, where the data exchange is triggered by an individual granting his consent and the data is exchanged between two participants.

## Non-personal B2B data exchange

![Non personal B2B data exchange](./diagrams/non-personal-data-exchange.svg)
There actors involved in the non personal B2B data exchange are the following:
|Actor|Description|
|-|-|
|Data Provider|A participant of the data space providing data. In this flow, we consider the data provider as both the entity responsible for the participant organisation and the participant application, which can be an API, a data source, or any kind of application.|
|Data Space Connector|Both participants have a data space connector in order to communicate with the infrastructure services and the other party's connector|
|Contract Service|An infrastructure service of the data space managing contracts and policies on data exchanges. It is used in this flow to verify the status and content of the contract to allow or block data exchange requests.|
|Catalog Service|An Infrastructure service of the data space enabling the management of resources, offerings, data space use cases and interfaces to allow for negotiation and contractualisation.

### Process breakdown

This process does not go over the negotiation and contractualisation process and assumes a data sharing agreement contract has already been signed between the two parties.

1. One of the parties of the contract request a data exchange to happen based on a signed contract to the catalogue. While this process shows the option to trigger the data exchange from the catalogue, it is one of several ways of triggering a data exchange. To keep things simple, let's consider this use case first.
2. The catalogue provides data exchange information and the contract to the data consumer connector. This information doubles down on the contract information to specify to the connector who the data provider is in this context, and where to proceed with the actual data request.
3. The consumer connector makes the data request to the provider connector with the received data exchange information and contract.
4. The data provider connector receives the incoming data request and communicates with the contract service to verify the status of the contract and get the policies associated to the resources that have been contractualised in this context.
5. The contract service verifies the authenticity and the status of the contract and returns the ODRL policies that should be verified by the connector for access control.
6. The connector interprets the ODRL policies using the PEP (Policy Enforcement Point) located within the connector. If the policies are validated, the process continues, if not then the process ends and an error is returned to the data consumer's connector.
7. Data is pulled from the participant application using the resource representation located in the provider's offering(s) located in the contract. The connector uses the [credentials](./CREDENTIALS.md) that have been set on the [resource's representation](./RESOURCE_REPRESENTATION.md) to communicate with the participant application.
8. The provider connector POSTs the data to the Data Consumer connector
9. The consumer connector verifies policies on the contract to allow or block the provider to send the data and use the service provided by the data consumer acting as a service provider.
10. Data is pushed to the consumer participant application using the [credentials](./CREDENTIALS.md) that were set on the [service resource representation](./RESOURCE_REPRESENTATION.md).

## Consent-Driven data exchange

![consent driven data exchange](./diagrams/consent-driven-data-exchange.svg)

In addition to the actors from the previous data exchange flow, the consent-driven data exchange is triggered by an individual giving his consent for data sharing and thus, this adds a couple of actors to the flow.
|Actor|Description|
|-|-|
|Individual|The individual (user) who's data is being shared|
|Consent Service|The Personal Data Intermediary's consent service of the individual that manages consent and passes it around in the data exchange flow.|

### Process breakdown

1. The individual, through his PDI will grant consent for a specific data sharing.
2. The consent service will communicate with the contract service to verify the status of the data sharing contract that exists between the two participants for the wanted data exchange.
3. The consent service notifies the Provider's data space connector that an exchange needs to happen by providing the consent
4. The connector generates an access token to be used by the consumer and sends it back to the consent service, which will associate the token to the consent before sending it to the consumer's connector.
5. The consent service sends the consent to the Data space connector of the data consumer along with information as to what endpoint of the provider's data space connector to call to get data
6. The consumer connector makes the data request to the provider by providing the consent

The rest of the flow is in line with the process during a non-personal B2B data exchange.

---
\>\> [Resource Representation](./RESOURCE_REPRESENTATION.md)