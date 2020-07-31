FROM node:12-alpine

LABEL name "Jukebox"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

WORKDIR /app

COPY . .
RUN apk add --no-cache --virtual .build-deps build-base curl git python3 \
&& yarn install \
&& yarn run build \
&& yarn install --production \
&& apk del .build-deps

CMD ["node", "dist/main.js"]