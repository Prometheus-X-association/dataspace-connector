# Resource Representation

In data exchange flows, the data space connector should be able to communicate with the participant's application or data source to push or pull a specific resource under certain conditions. Resource representations are the information that allow just that. It is an extension to the Data / Software resource data model composing a participant's offering catalogue and it contains the needed metadata to allow the connector to know where and how to pull or push data from / to a participant application.

## Data Exchange Flows

Let's take a look at how data exchange flows work to understand why resource representations are needed.

### Non-personal B2B data exchange
![Non personal B2B data exchange](./diagrams/non-personal-data-exchange.svg)
There actors involved in the non personal B2B data exchange are the following:
|Actor|Description|
|-|-|
|Data Provider|A participant of the data space providing data. In this flow, we consider the data provider as both the entity responsible for the participant organisation and the participant application, which can be an API, a data source, or any kind of application.|
|Data Space Connector|Both participants have a data space connector in order to communicate with the infrastructure services and the other party's connector|
|Contract Service|An infrastructure service of the data space managing contracts and policies on data exchanges. It is used in this flow to verify the status and content of the contract to allow or block data exchange requests.|
|Catalog Service|An Infrastructure service of the data space enabling the management of resources, offerings, data space use cases and interfaces to allow for negotiation and contractualisation.

#### Process breakdown

This process does not go over the negotiation and contractualisation process and assumes a data sharing agreement contract has already been signed between the two parties.

1. One of the parties of the contract request a data exchange to happen based on a signed contract to the catalogue. While this process shows the option to trigger the data exchange from the catalogue, it is one of several ways of triggering a data exchange. To keep things simple, let's consider this use case first.
2. The catalogue provides data exchange information and the contract to the data consumer connector. This information doubles down on the contract information to specify to the connector who the data provider is in this context, and where to proceed with the actual data request.
3. The consumer connector makes the data request to the provider connector with the received data exchange information and contract.
4. The data provider connector receives the incoming data request and communicates with the contract service to verify the status of the contract and get the policies associated to the resources that have been contractualised in this context.
5. The contract service verifies the authenticity and the status of the contract and returns the ODRL policies that should be verified by the connector for access control.
6. The connector interprets the ODRL policies using the PEP (Policy Enforcement Point) located within the connector. If the policies are validated, the process continues, if not then the process ends and an error is returned to the data consumer's connector.
7. Data is pulled from the participant application using the resource representation located in the provider's offering(s) located in the contract.
