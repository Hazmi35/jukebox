![](jukebox.png)
# Jukebox
> Just a simple Discord music bot

![](https://github.com/Hazmi35/jukebox/workflows/Node.js%20CI/badge.svg)
![](https://badgen.net/badge/icon/typescript?icon=typescript&label)
<a href="https://heroku.com/deploy?template=https://github.com/Hazmi35/jukebox"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy"></a>

## Install

Without optional packages
```shell script
npm install --production --no-optional
# or with yarn
yarn install --production --ignore-optional
```

With optional packages (Recommended)

```shell script
npm install --production
# or with yarn
yarn install --production
```

For optional packages you need to install build tools as stated here: [Build Tools](https://github.com/nodejs/node-gyp#installation)

## Usage

Rename `.env.schema` to `.env` and fill out the values:
Note: If you're using "Deploy to Heroku" button, you don't need to do this.

```dotenv
DISCORD_TOKEN=
YT_API_KEY=
```

## Features
- TypeScript! This bot is using TypeScript in a way that is easy to understand. Even a [dogmeat](https://fallout.fandom.com/wiki/Dogmeat_(Fallout_4)) can understand the code!
- Discord.JS! Who doesn't like Discord.JS? Robust module, robust documentation!
- Using the concept of extending base command, similar to Commando.
- A production-ready music bot, suitable for you that dislike hassling with the code.

Based on [discord-music-bot](https://github.com/iCrawl/discord-music-bot)
