# Dockerfile for WireMock
FROM wiremock/wiremock:latest
COPY /utils/contract/stubs/ /home/wiremock/mappings
HEALTHCHECK NONE
ENTRYPOINT ["/docker-entrypoint.sh", "--global-response-templating", "--disable-gzip", "--verbose", "--port", "8081"]
