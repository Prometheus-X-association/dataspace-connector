# Use the official MongoDB image as the base image
FROM mongo:6.3.0

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

USER nonroot

# Expose the default MongoDB port
EXPOSE 27017

# Set the default command to run when the container starts
CMD ["mongod"]