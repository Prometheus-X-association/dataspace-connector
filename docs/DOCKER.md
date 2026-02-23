# Docker compose
## Prerequisites
- Docker and Docker Compose installed on your machine.
- A `.env` file at the root of the project with the following variables defined:
```bash
NODE_ENV=production
PORT=3000

SESSION_SECRET=abc
SESSION_COOKIE_EXPIRATION=24000

MONGO_URI=mongodb://mongodb:27017/dataspace-connector

CURATOR=https://visionspol.eu
MAINTAINER=https://visionspol.eu

# Logs
WINSTON_LOGS_MAX_FILES=14d
WINSTON_LOGS_MAX_SIZE=20m

#jwt
JWT_BEARER_TOKEN_EXPIRATION=3h
JWT_REFRESH_TOKEN_EXPIRATION=1d

# Exchange Trigger
EXCHANGE_TRIGGER_API_KEY=your_exchange_trigger_api_key_here

# Exchange Timeout in seconds
EXCHANGE_TIMEOUT=120

NAME=test-pdc
DNS=test.pdc.visionstrust.com
```
- A `src/config.json` or `config.json` (**update docker compose**) file with the appropriate configuration for your connector. You can use the `src/config.sample.json` as a template and update it according to your needs.

## Sample file
```yaml
services:
  dataspace-connector:
    image: dataspace-connector:latest # Update with version tag if needed
    container_name: ${NAME}-dataspace-connector
    restart: unless-stopped
    tty: true
    volumes:
      - './src/:/usr/src/app/src'
      - './src/config.json:/usr/src/app/src/config.json:ro' # Mount config as read-only, you can update the volume to ./config.json
    environment:
      MONGO_URI: ${MONGO_URI}
      NAME: ${NAME}
      DNS: ${DNS}
      PORT: ${PORT}
    depends_on:
      - mongodb
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=web"

      - "traefik.http.routers.${NAME}.rule=Host(`${DNS}`)"
      - "traefik.http.routers.${NAME}.entrypoints=websecure"
      - "traefik.http.routers.${NAME}.tls.certresolver=letsEncrypt"

      - "traefik.http.services.${NAME}.loadbalancer.server.port=${PORT}"
    networks:
      - web
      - internal

  mongodb:
    image: dataspace-connector-mongodb:latest # Update with version tag if needed
    container_name: ${NAME}-mongodb
    restart: unless-stopped
    volumes:
      - ./data:/data/db
    networks:
      - internal

  pdc-dashboard:
    image: dataspace-connector-dashboard:latest # Update with version tag if needed
    container_name: ${NAME}-dashboard
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=web"

      - "traefik.http.routers.${NAME}-dashboard.rule=Host(`${DNS}`) && PathPrefix(`/dashboard`)"
      - "traefik.http.routers.${NAME}-dashboard.entrypoints=websecure"
      - "traefik.http.routers.${NAME}-dashboard.tls.certresolver=letsEncrypt"

      - "traefik.http.middlewares.${NAME}-dashboard-strip.stripprefix.prefixes=/dashboard"
      - "traefik.http.routers.${NAME}-dashboard.middlewares=${NAME}-dashboard-strip"

      - "traefik.http.services.${NAME}-dashboard.loadbalancer.server.port=80"
    networks:
      - web
      - internal

networks:
  web:
    external: true
  internal:
    driver: bridge
```

## Custom connector

If a custom connector is needed, clone the project, add the custom code and use `docker-compose.old.yaml` as a template to create a custom `docker-compose.yaml` file. Then build the custom images and launch the containers with the following command, once .env and src/config.json are created:

```bash
docker compose up -d --build
```