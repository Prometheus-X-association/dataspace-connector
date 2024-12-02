# Use the official Node.js image as base image
FROM node:lts
ARG WHO

RUN echo $WHO

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#COPY package.json .
#
#RUN git init

## Bundle app source
COPY . .

RUN rm -f node_modules
RUN rm -f /src/logs
RUN cd /src & rm -f *.json & cd ..

RUN mkdir -p /usr/src/app/src/logs
RUN mkdir -p /usr/src/app/src/keys
COPY ./sandbox/infrastructure/utils/$WHO/config.development.json /usr/src/app/src/

# Install app dependencies
RUN CI=true pnpm i

# Expose the port on which the app will run
EXPOSE 3000

CMD npm run dev