# Prometheus-X Dataspace Connector

## WORK IN PROGRESS

## Installation

1. Clone the repository from GitHub:
```bash
git clone https://github.com/Prometheus-X-association/dataspace-connector.git
```
2. Install packages using pnpm
```bash
pnpm i
```
3. Copy the .env.sample into a .env of your choice (.env, .env.development...) and set your environment variables
```bash
cp .env.sample .env
```
4. Copy the config.sample.json into a config.json and set your configuration variables
```bash
cp .env.sample .env
```

## Docker
You can launch the data space connector with docker and docker compose, by using the following command at the root of the project.
```bash
docker compose build && docker compose up -d
```
or

```bash
docker compose up -d
```
The docker compose launch the app and a mongodb container.
If you want you can use your own mongodb database by updating the following variable in your .env
```bash
MONGO_URI=MONGO_URI=mongodb://mongodb:27017/dataspace-connector
```

## Data space connector configuration
You have two ways to configure your data space connector. 

By API route at PUT "/private/configuration" (see documentation at /docs) or manually by copying the config.sample.json to config.json inside the src file of the project.

```bash
cp config.sample.json config.json
```

The config file contains the following variables :
```bash
{
    "endpoint": "", //endpoint of your data space connector
    "serviceKey": "", // service key provided by the catalog
    "secretKey": "", // secret key provided by the catalog
    "catalogUri": "", // the uri of the catalog
    "contractUri": "", // the uri of the contract
    "credentials": [ //optional if you want to manually add credentials into the data space connector
        {
            "_id": "", // you can use the command npm run uid --number=1 to generate id
            "value": "", // password or value
            "type": "", // between apiHeader or basic
            "key": "" // username or key
        }
    ]
}

```
Please be care, for the uri you must end the string with "/", like so "http://catalog.api.com/v1/"

You're all set !

### Running in development
1. Copy .env.sample to .env.development
2. Copy config.sample.json to config.json
3. Run the app using the dev command
```bash
pnpm dev
```
You can configure any .env.anything file that you want, if you need to have control over different environments. When running the app you just need to specify which development you are in for the app to pick up the correct .env file.

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

If you encounter any issues or have questions regarding the Prometheus-X Catalog Registry, feel free to open an issue on the GitHub repository. The project maintainers and community members will be happy to assist you.