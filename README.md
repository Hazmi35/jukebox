![](.github/images/jukebox.png)
# Maintenance Notice
⚠️ Due to rapid changes on the library Jukebox used, and Discord API, this branch of Jukebox is discontinued.

New Jukebox would be created in `new` branch.

# Jukebox
> Just a simple Discord music bot

<a href='https://discordapp.com/oauth2/authorize?client_id=698573904129818624&permissions=53857345&scope=bot'><img src="https://img.shields.io/static/v1?label=Invite%20Me&message=Jukebox%239319&plastic&color=7289DA&logo=discord"></a>
<a href='https://hub.docker.com/r/hazmi35/jukebox' alt="Available on Docker Hub"><img src="https://badgen.net/docker/size/hazmi35/jukebox/latest/amd64"></a>
<a href='https://github.com/Hazmi35/jukebox/actions?query=workflow%3A%22Lint+code+%26+compile+test%22'><img src='https://github.com/Hazmi35/jukebox/workflows/Lint%20code%20&%20compile%20test/badge.svg' alt='CI Status' /></a>
<img src="https://badgen.net/badge/icon/typescript?icon=typescript&label">
<a href="https://heroku.com/deploy"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy"></a>

## Usage

**[⚠] Requires [Node.JS](https://nodejs.org) version 16.6.0 or above.**

1. Install [Node.JS](https://nodejs.org)
2. Install requirements for yt-dlp

   For Linux/Mac OS/Unix-like system, install [Python 3](https://www.python.org/downloads/), and add them to the PATH environment variable

   For Windows, you don't need to install Python, but you need to install [Microsoft Visual C++ 2010 Service Pack 1 Redistributable Package (x86)](https://download.microsoft.com/download/1/6/5/165255E7-1014-4D0A-B094-B6A430A6BFFC/vcredist_x86.exe)

3. Rename `.env.schema` to `.env` and fill out the values (example on .env.example)
4. Install dependencies as stated [here](https://github.com/Hazmi35/jukebox#install)
5. Run `npm run build`
6. (Optional) Prune dev dependencies (This is good to save disk spaces):
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
We also provide [docker-compose.yml](docker-compose.yml) and [docker-compose.debian.yml](docker-compose.debian.yml) if you want to go that way.

There is also a [docker-compose.pull.yml](docker-compose.pull.yml) version, which pulls the image from Docker Hub (latest tag, alpine)

### Compose Example
```sh
$ docker-compose up
```
