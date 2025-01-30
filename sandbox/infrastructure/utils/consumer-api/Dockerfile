# Dockerfile for WireMock
FROM wiremock/wiremock:latest
COPY /utils/consumer-api/stubs/ /home/wiremock/mappings
ENTRYPOINT ["/docker-entrypoint.sh", "--global-response-templating", "--disable-gzip", "--verbose", "--port", "8031"]
