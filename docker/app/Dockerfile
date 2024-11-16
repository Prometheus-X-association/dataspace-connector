# Use the official Node.js image as base image
FROM node:lts
ARG ENV
ENV ENV $ENV

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
#TODO
COPY package.json .

RUN git init

## Bundle app source
COPY . .

#COPY ./start.sh /usr/src/app/start.sh
RUN chmod +x /docker/scripts/start.sh

RUN rm -f node_modules
RUN rm -f /src/logs

RUN mkdir -p /src/logs
RUN mkdir -p /src/keys

# Install app dependencies
RUN CI=true pnpm i

# Expose the port on which the app will run
EXPOSE 3000

CMD ["/docker/scripts/start.sh", "$ENV"]