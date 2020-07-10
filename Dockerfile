FROM node:12-alpine

LABEL name "Jukebox"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

WORKDIR /usr/Jukebox

COPY . .
RUN apk add --no-cache --virtual .build-deps python3 build-base git curl \ 
&& apk add --no-cache --virtual .third-party ffmpeg \
&& yarn install \
&& yarn build \
&& yarn install --production \
&& apk del .build-deps

CMD ["node", "dist/main.js"]