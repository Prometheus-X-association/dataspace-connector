# Dockerfile for WireMock
FROM wiremock/wiremock:latest
COPY /utils/catalog/stubs/ /home/wiremock/mappings
ENTRYPOINT ["/docker-entrypoint.sh", "--global-response-templating", "--disable-gzip", "--verbose", "--port", "8082"]
