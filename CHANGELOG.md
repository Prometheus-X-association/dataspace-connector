## [1.8.0] [Unreleased]

### Added

- version from package.json in swagger docs
- added docs for contracts endpoints
- added verifyPII function on B2b exchange
- added CHANGELOG.md
- added docs for the sandbox
- added docs for the DPCP
- added billing processes to PEP
- added services
- added DPCP library
- added Sandbox environment, dockerfile and docs
- introduced infrastructure configuration routes and models
- added `headerProcessing` function and moved all logic about HTTP request to the representation in the representationFetcher.ts
- added `x-ptx-incomingDataspaceConnectorURI`, `x-ptx-dataExchangeId`, `x-ptx-contractId`, `x-ptx-contractURL`, `x-ptx-consentId` in header request made by the connector to the representation URL

### Changed

- delete useless comment
- updated tests and sandbox
- replace `_id` by `catalogId` for the dataprocessingChain
- Changed controller to move logic to services
- Integrated ESLint for consistent code quality
- Enhanced package.json with necessary updates
- Improved Dockerfile for better compatibility and performance
- Updated project documentation and Swagger specifications
- Updated the consent and B2B exchange flow to support selecting and using a specific data processing chain
- Axios mock enhanced

### Fixed

- fixed the b2b flow to avoid creating two dataExchange
- sandbox and PII

## [1.7.0-beta.1] [Unreleased]

### Changed

- Update `src/utils/paramsMapper.ts`

### Fixed

- add `--development` parameter to fix start up of the connector
- adjustments & fix attempt for json comms

## [1.6.0-beta.1] - 2024-12-02

### Added

- PDI.md
- mock axios GET method call for contract in OAC test cases
- Ensure that a valid subscription is retrieved from the billing system. 
- added limitDate, payAmount and usage count billing oac service.
- added basic missing ts interfaces related to resources.
- added documentation
- added query params on get representation
- added type in contract response
- added draft tests for providerExportService in the billing context

### Changed

- modification to allow the trigger of the exchange on both side
- update mocks, update billing test cases.
- Update test cases
- Review PEP, policy fetcher, and connector PEP verification
- removed commented code
- use LTS in Dockerfile
- update screens
- updated route to update userIdentifier and delete
- updated PDI docs
- move providerExport business logic to a service for easier testing and maintenance, Review DataExchange model to avoid TypeScript errors
- link billingUri and consumerID to billing fetching functions, review the code accordingly
- review PEP to support leftOperand services callback, add base of billing subscription services, update test cases.
- review PEP access request, remove unecessary code related to the listing of the leftOperand proccesses
- review exportData add related service, test: update billing test cases.
- code review on exchanges services and controllers (using PEPVerification) for improved clarity

### Fixed

- PEP error on notificationMessage policy
- consumer URI in x-interlocutor-connector instead of the provider for get the representation

## [1.5.0-beta.1] - 2024-05-27

### Added

- added url on User
- added limit config for express body size
- added pdi iframe route
- reload configuration added a cleaning of the consentJWT
- added data management
- decrypedConsent is optional params for representationFetcher.ts functions 
- added conditional headers on representationFetcher.ts functions 
- added consent manager revoke route
- added consent manager revoke route
- added consent flows for user management

## Changed

- updated docs
- updated consumer/exchanges endpoint
- updated consumer/exchanges endpoint
- update reload configuration
- updated bilateral flow with resource in data exchange
- updated postbuild command to copy .env.production and config.production.json into dist dir
- updated docs with production command

### Fixed

- comments updated
- reload configuration now register self-description

## [1.4.0-beta.1] - 2024-04-08

### Added

- added documentation for the CORS configuration
- added consentId and x-interlocutor-connector in headers for axios call made to participant representation endpoint
- added cors configuration for PDI modal
- PDI uri
- added modification for user flow adaptation

### Changed

- docs and misc 
- language & improvements to cors

## [1.3.0-beta.1] - 2024-03-19

### Added

- added listResourceLeftOperands function 
- added selfDescriptionProcessor.ts to allow backward compatibility with contract (selfdescription or Id)
- docs
- augmentation of the dataExchange model to have it at the supplier and at the consumer in a synchronized way for better management of the state of the exchange and fewer parameters in webhooks
- added provider import route
- handler throw error on catch
- leftOperands verification
- added command in dockerfile to create keys directory
- added data exchange on consent flow

## Changed

- updated consent flow with payloadRepresentation
- docs
- updated configuration.ts with consentUri
- processLeftOperands update
- update docs and error response fro credentials.private.controller.ts and dataExchange.public.controller.ts

### Fixed

- waiting changes on listResourceLeftOperands
- replace internalID reference by userId
- rollback internalID payload
- useless return restfulResponse

## [1.2.0-beta.1] - 2024-02-27

### Added

- replace in user consent route, Authorization with x-user-key 
- populate privacyNoticeById and consentById routes 
- added query params to trigger data exchange in give consent route
- added command to launch local environment for provider and consumer with npm
- added available exchanges routes feat: updated json-odrl-manager version feat updated documentation
- added consentUri to config.sample.json

### Changed

- docs
- gitignore
- triggerExchange
- populate
- response error
- update error response from consent
- deleted example and added example response for auth route
- typos & issues from persistent storage
- importData response change
- updated pep verification for consent flow

### Fixed

- map container port to the PORT value in .env

## [1.1.0-beta.1] - 2024-02-20

### Added

- added test for configuration file
- added api tests main
- added consent routes
- added properties on types
- added RSA key for private repo in docker 
- added config.json for docker sandbox 

### Changed

- docs
- Implement 'count' mongo related processes
- review access control to manage the call of default 'left operand' count value from internal endpoint
- update odrl manager
- start implementation of default leftoperand retrieval value processes
- review access control accordingly.
- updates after test for the pep verification

### Fixed

- return new updated configuration when she is reload from the route /reload
- token time validity expand
- docs authentication
- misc. fixes response, Logger info clean, swagger, tes envrionnement condition
- uncomment setupEnvironnement

## [1.0.0-beta.1] - 2024-02-02

### Added

- decrypt content get consent signature if doesn't exist
- added login _links in self-description
- credential for consent exchange
- added security on private routes
- added configuration to reload config.json or delete config
- url checker added to avoid error with backslash in url 
- added comment
- added PEP verification on the data endpoints

### Changed

- updated docs
- updated startup to required the config.json file
- updated csv upload routes to call new consent manager routes

### Removed

- docs directory error on heroku

### Fixed

- fiw error set header fix: use url with params replace in consumer import
- representationFetcher.ts api-header change to apiKey
- putConsumerData
- don't create user if error on consent manager
- create keys and docs dir at postbuild
- delete key verification on serviceKey and secretKey
- logger added location fix: avoid error on swagger file feat: added function for PEP verification and avoid error with self-description and id
- moved consumer controller in public
- optimized misc
- typos

## [0.1.0-beta.1] - 2024-01-26

### Added

- added more project setup and templates
- add License
- added base of pdp and pep
- added data and consent routes
- credential added
- added route to create resource in catalog
- README.md update
- .gitignore, .dockerignore and pnpm-lock.yaml update
- server update
- APIResponse.ts 
- jwt
- routes
- configuration
- description
- config.sample.json
- documentation configuration
- database configuration
- file
- catalog
- configuration of nodemon, ts and package
- authentication
- docker
- Implement processLeftOperand, add related test case.
- added user routes
- added consumer error function 
- added enum
- added file watching is tsconfig.json
- added the two connector in a same network 
- review test process
- Introduce getTargetedPolicies in PEP to fetch policies based on the provided path from input data.
- added git init
- added public routes denpoint in self-description
- added endpoint to retrieve configuration
- added public key
- integration of PEP in the provider side 
- Bearer token
- Review PEP AccessRequest field semantics, add referenceDataPath to the AccessRequest type, consolidate PDP's addReferencePolicy and PEP's getTargetedPolicies, add additional error handling to those methods.
- added consent userIdentifier creation when a user is created feat(configuration): added contractUri
- Write swagger at startup
- added initial documentation elements
- added resourceId and purposeId in dataexchange models and routes
- added location in logger fix(consumer routes): removed auth and added right router in index.ts
- added representationFetcher.ts for method en credential use
- added service and request handler
- add full documentation
- Consent exchange done

### Removed

- deleted README files inside app because they made the app crashed feat: added docker configuration for development
- removed contractId and contractType, replaced by contract self-description

### Changed

- rename catalogId to resourceId
- changed url
- moved config file in src directory
- node version & mongoose version
- moved consumer route to public
- tests
- update README.md
- review PolicyFetcher to allow dynamic methods configuration for leftOperand service calls
- Improving PolicyFetcher for dynamic URL handling and flexible requests
- review PEP, add logs and updated tests
- improve handling of optional fetching parameters in the leftOperand value fetching process
- update config sample file
- update configuration routes feat: allow the app to startup without config.json
- env update
- changes consent export routes to allow the communication with the consent
- prettier update, double quote to single quote
- updates docker to allow external mongo database
- credentials updates to allow the credentials configuration from the config.json
- change made in the consumer side to use the contract id and to don't use the resourceId comming from the catalog anymore
- change logic and errors management in webhooks routes
- config file are now in src

### Fixed

- correct parameter handling in fetching request
- generate token for catalog get routes
- create config.json if not created
- setEnvironnement for heroku
- json-odrl-manager dependencies fix: Logger in access control files
- start script
- Change csv export route
- contract connection.
- build error with declaration


[1.8.0]: https://github.com/Prometheus-X-association/dataspace-connector/pull/26
[1.7.0-beta.1]: https://github.com/Prometheus-X-association/dataspace-connector/pull/20
[1.6.0-beta.1]: https://github.com/Prometheus-X-association/dataspace-connector/releases/tag/v1.6.0-beta.1
[1.5.0-beta.1]: https://github.com/Prometheus-X-association/dataspace-connector/releases/tag/v1.5.0-beta.1
[1.4.0-beta.1]: https://github.com/Prometheus-X-association/dataspace-connector/releases/tag/v1.4.0-beta.1
[1.3.0-beta.1]: https://github.com/Prometheus-X-association/dataspace-connector/releases/tag/v1.3.0-beta.1
[1.2.0-beta.1]: https://github.com/Prometheus-X-association/dataspace-connector/releases/tag/v1.2.0-beta.1
[1.1.0-beta.1]: https://github.com/Prometheus-X-association/dataspace-connector/releases/tag/v1.1.0-beta.1
[1.0.0-beta.1]: https://github.com/Prometheus-X-association/dataspace-connector/releases/tag/v1.0.0-beta.1
[0.1.0-beta.1]: https://github.com/Prometheus-X-association/dataspace-connector/releases/tag/v0.1.0-beta.1