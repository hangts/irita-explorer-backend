FROM node:14.4.0-alpine3.12

WORKDIR /app
COPY . .

RUN apk add git && npm install cnpm rimraf -g && yarn install && npm run build



CMD npm run start:prod