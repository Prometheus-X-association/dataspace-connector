# Use the official Node.js image as base image
FROM node:16

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN git init

## Bundle app source
COPY . /usr/src/app

RUN rm -f node_modules

# Install app dependencies
RUN CI=true pnpm i

# Expose the port on which the app will run
EXPOSE 3000