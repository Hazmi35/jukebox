![](.github/images/jukebox.png)
# Jukebox
> Just a simple Discord music bot

<a href='https://discordapp.com/oauth2/authorize?client_id=698573904129818624&permissions=53857345&scope=bot'><img src="https://img.shields.io/static/v1?label=Invite%20Me&message=Jukebox%239319&plastic&color=7289DA&logo=discord"></a>
<a href='https://hub.docker.com/r/hazmi35/jukebox' alt="Available on Docker Hub"><img src="https://badgen.net/docker/size/hazmi35/jukebox/latest/amd64"></a>
<a href='https://github.com/Hazmi35/jukebox/actions?query=workflow%3A%22Lint+code+%26+compile+test%22'><img src='https://github.com/Hazmi35/jukebox/workflows/Lint%20code%20&%20compile%20test/badge.svg' alt='CI Status' /></a>
<img src="https://badgen.net/badge/icon/typescript?icon=typescript&label">
<a href="https://heroku.com/deploy"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy"></a>

## Usage

**[⚠] Requires [Node.JS](https://nodejs.org) version 12.9.0 or above.**

1. Install [Node.JS](https://nodejs.org)
2. Rename `.env.schema` to `.env` and fill out the values (example on .env.example)
3. Install dependencies as stated [here](https://github.com/Hazmi35/jukebox#install)
4. Run `npm run build`
5. (Optional) Prune dev dependencies (This is good to save disk spaces):
```sh
$ npm prune --production
```
1. Start it with `npm start`. And you're done!

Notes: 
1. You only need to configure .env file when you're using the [Docker image](https://github.com/Hazmi35/jukebox#Docker)
2. If you're using "Deploy to Heroku" button, you don't need to do this.

## Install

Without optional packages
```sh
$ npm install --no-optional
```

With optional packages (Recommended)

```sh
$ npm install
```
For optional packages, you need to install build tools as stated [here](https://github.com/nodejs/node-gyp#installation) and you also need to install [Git](https://git-scm.com/)

## Docker
Want to use Dockerized version of jukebox? sure! we provide them on the [Docker Hub](https://hub.docker.com/r/hazmi35/jukebox) and also in [GitHub Container Registry](https://github.com/users/Hazmi35/packages/container/package/jukebox)

### Volumes
[Docker Volumes](https://docs.docker.com/storage/volumes/) are needed to store cache and logs persistently

### Example:
```sh
$ docker run --env-file .env --volume cache:/app/cache --volume logs:/app/logs --restart unless-stopped hazmi35/jukebox
```
We also provide [docker-compose.yml](docker-compose.yml) if you want to go that way

### Compose Example
```sh
$ docker-compose up
```

## Features
- A production-ready music bot, suitable for you that dislike hassling with the code.
- Basic Commands (Help, Ping, Invite & Eval [for advanced bot owners])
- Basic Music Commands (Play, Skip, Stop, Pause & Resume, Now Playing, Queue, Repeat, Volume)
- Caching! (cache youtube downloads)
- Configurable
- Docker-friendly
- Lightweight (only around 120MB with dev dependencies pruned)

Based on [discord-music-bot](https://github.com/iCrawl/discord-music-bot)
