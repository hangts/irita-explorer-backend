FROM node:16.15.1-alpine3.16 AS builder

WORKDIR /app
COPY . .

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
apk add git && yarn install && npm run build  && yarn cache clean

CMD npm run start:prod