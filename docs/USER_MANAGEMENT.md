# User management for consent-driven data exchanges

When talking about Consent-Driven Data Exchanges, the question of user identity is a very important one. The Data Space connector needs to be able to reconciliate the identity of the user inside of the organisation's application/data source to the identity of the user that has granted the consent to share his data in order for the connector to push / pull the appropriate data for the right user in the data exchange flow.

## The Personal Data Intermediary

To understand user management, it is essential to understand what the Personal Data intermediary (PDI) is and what it represents for individuals. The PDI is an extension of the Consent manager building block, which acts as the user's "wallet" for handling and managing consents on data sharing across the data space. 

As per how the internet works, individuals have an account in their PDI and accounts in the data and service provider applications. This account can be associated to different specificities of what the individual informed for his identity. Currently, the way the consent manager building block handles user identity is by considering the user email as the single source of truth for the user's identity.

An individual is free to provide any email he wishes to use to create accounts on different services, thus, potentially creating mismatches between his identity in service applications and his account in his PDI. 
To fix this, the PDI has a model called the User Identifier that makes the association between the user's identity in the PDI and his identity in each and every service application that uses the consent management service. The consent manager has internal operations at several points of the flow to be able to associate user identifiers with different emails to the global user account in the PDI.

In essence, the PDI enables consent management from individuals and provides a solution for identity management for the different service applications connected to it.

## Management of user identifiers

As seen above, the PDI generates User Identifiers for every service application that is registered to the PDI for consent management. The role of the data space connector in all of this is to store the user identifiers of each and every user that exists in the service's application using the connector. This, in turn, enables the connector to reconciliate the identity from the consent to the identity of the service application to pull data from the correct user and push it to the right location.

## Registering users to the PDI through the connector

The process of registering users to the PDI is a very important one as if the user from your service does not exist as a User Identifier in the PDI, the data exchange cannot take place.

Registering users is a straightforward process and can be done easily through the connector. The only information needed by the consent service, and thus the connector, is the user's email and his internal ID from the application. This is what enables the connector to know how to provide to your application the correct email or ID when pushing and pulling data.

![user management](./diagrams/user-management.svg)

### Providing a CSV file

One way to handle user registration is by providing a CSV file of users, where their email and ID are informed. The connector will then handle registering all of the users to the consent service and store the generated user identifiers inside of its database.

// TODO Endpoint or swagger

### Providing the users through the admin API

Registering users through the connector's admin API enables direct integration and automation with existing applications. When registering through the admin API, it is simple to integrate the registration of the user to the PDI into any existing sign up flow to your application.

Integrating the user registration process through API allows to streamline the process for users as it reduces the risk for them to not have a user identifier for the said participant.

// TODO Endpoint or swagger

## The aim for using wallets

As a side note, while currently not supporting wallets for user identity, one of the aims for the Data Space Connector is to support the use of wallets to facilitate the management of user identity across the data space.