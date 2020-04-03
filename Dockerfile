FROM node:12-alpine

LABEL name "Jukebox"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

ENV DISCORD_TOKEN= \
    MONGODB_URI=
WORKDIR /usr/Jukebox

COPY . .
RUN echo [INFO] Installing build deps... \
&& apk add --update \
&& apk add --no-cache --virtual .build-deps build-base python g++ make \
&& echo [INFO] Build deps installed! \
&& echo [INFO] Installing 3rd party packages... \
&& apk add --no-cache git curl ffmpeg \
&& npm install pnpm --global \
&& echo [INFO] 3rd party packages installed! \
&& echo [INFO] Node version: $(node --version) \
&& echo [INFO] npm version: $(npm --version) \
&& echo [INFO] pnpm version: $(pnpm --version) \
&& echo [INFO] Git version: $(git --version) \
&& echo [INFO] Installing npm packages... \
&& pnpm install \
&& echo [INFO] All npm packages installed! \
&& echo [INFO] Everything looks okay. \
&& echo [INFO] Building TypeScript project... \
&& echo Using TypeScript version: $(node -p "require('typescript').version") \
&& pnpm run build \
&& echo [INFO] Done building TypeScript project! \
&& echo [INFO] Pruning devDependencies... \
&& pnpm prune --production \
&& apk del .build-deps \
&& echo [INFO] Done! Starting bot with pnpm start

CMD ["pnpm", "start"]