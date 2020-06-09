FROM node:14.4.0-alpine3.12

WORKDIR /app
COPY . .

RUN npm install
CMD npm run start:prod