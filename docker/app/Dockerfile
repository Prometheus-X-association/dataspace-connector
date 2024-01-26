# Use the official Node.js image as base image
FROM node:16
ARG ENV
ENV ENV $ENV

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN git init

## Bundle app source
COPY . /usr/src/app

#COPY ./start.sh /usr/src/app/start.sh
RUN chmod +x /usr/src/app/docker/scripts/start.sh

RUN rm -f node_modules
RUN rm -f /src/logs

RUN mkdir -p /usr/src/app/src/logs

# Install app dependencies
RUN CI=true pnpm i

# Expose the port on which the app will run
EXPOSE 3000

CMD ["/usr/src/app/docker/scripts/start.sh", "$ENV"]
#
#CMD ["npm", "run", "dev"]