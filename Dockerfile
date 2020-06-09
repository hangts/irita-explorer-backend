FROM node:14.4.0-alpine3.12 as builder

WORKDIR /app
COPY . .

RUN npm install && npm run build


FROM node:14.4.0-alpine3.12
WORKDIR /app

COPY --from=builder /app/dist .
CMD npm run start:prod