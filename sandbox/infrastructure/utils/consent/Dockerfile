FROM node:18
WORKDIR /app
COPY /utils/consent .
RUN npm install
EXPOSE 8083
CMD ["node", "app.js"]