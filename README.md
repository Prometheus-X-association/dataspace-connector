# Prometheus-X Dataspace Connector

The Data Space Connector is an open source project aimed to facilitate the onboarding and participantion of organisations in the data space. It is built with simplicity in mind and offers the necessary functionalities for organisations to communicate with the core components of the data space such as [Catalogue](https://github.com/Prometheus-X-association/catalog-api) for resources, offerings and data space use cases management, [Contract](https://github.com/Prometheus-X-association/contract-manager) for negotiation and contract verification and [Consent](https://github.com/Prometheus-X-association/consent-manager) for the management of consent driven data exchanges.

## Installation

### Docker
You can launch the data space connector with docker and docker compose by using the following command at the root of the project.

```bash
docker compose build && docker compose up -d
```
or

```bash
docker compose up -d
```

The docker compose file will launch the app and a mongodb container.

> Using your own mongodb database is possible by updating the following  variable in your .env
> ```bash
> MONGO_URI=mongodb://mongodb:27017/dataspace-connector
> ```

> If you run into issues restarting docker-compose, try rebuilding and restarting the containers with `sudo` like so: 
> ```bash
> sudo docker-compose up --build
> ```

### Classic installation

1. Clone the repository from GitHub:
```bash
git clone https://github.com/Prometheus-X-association/dataspace-connector.git
```
2. Install packages using pnpm
```bash
npm i -g pnpm # If pnpm is not installed
pnpm i
```
3. Copy the .env.sample into a .env and set your environment variables
```bash
cp .env.sample .env
```
4. Copy the config.sample.json into a config.${NODE_ENV}.json and set your configuration variables
```bash
# Copy the config.sample.json to config.${NODE_ENV}.json matching your NODE_ENV variable

#For production
cp src/config.sample.json src/config.production.json
```

## Documentation

Visit this [repository's wiki](https://github.com/Prometheus-X-association/dataspace-connector/wiki) to find documentation related to the PDC.

## Contributing

Contributions to the Prometheus-X Dataspace Connector are welcome! If you would like to contribute, please follow these steps:

1. Fork the repository on GitHub.
2. Create a new branch for your feature or bug fix.
3. Make the necessary code changes, adhering to the project's coding style and guidelines.
4. Write appropriate tests to ensure code integrity.
5. Commit your changes and push the branch to your forked repository.
6. Submit a pull request to the main repository, describing your changes in detail.

Please ensure that your contributions align with the project's coding standards, have proper test coverage, and include necessary documentation or updates to existing documentation.

## License

The Prometheus-X Dataspace Connector is released under the [MIT License](LICENSE). You are free to use, modify, and distribute the software as per the terms specified in the license.

## Support

If you encounter any issues or have questions regarding the Prometheus-X Data Space Connector, feel free to open an issue on the GitHub repository. The project maintainers and community members will be happy to assist you.