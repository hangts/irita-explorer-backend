FROM node:16.15.1-alpine3.16 AS builder

WORKDIR /app
COPY . .

RUN apk add git && yarn install && npm run build



CMD npm run start:prod