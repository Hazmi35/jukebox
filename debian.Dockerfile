FROM hazmi35/node:16-dev as build-stage

LABEL name "Jukebox (build stage)"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Copy package.json, lockfile and .npmrc
COPY package*.json ./
COPY .npmrc .

# Install dependencies
RUN npm install

# Copy Project files
COPY . .

# Build TypeScript Project
RUN npm run build

# Prune devDependencies
RUN npm prune --production

# Check if important dependencies is healthy
RUN YOUTUBE_DL_FILENAME="yt-dlp" node -p "console.log((require('prism-media').FFmpeg).getInfo());(require('youtube-dl-exec'))('--version').then(console.log)"

# Get ready for production
FROM hazmi35/node:16

LABEL name "Jukebox"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Install python3 (required for youtube-dl/yt-dlp) and sudo then create cache and logs directory
# Plus delete user "node" and create user "jukebox"
RUN apt-get update \
    && apt-get install -y python-is-python3 locales sudo \
    && apt-get autoremove -y \
    && apt-get autoclean -y \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir cache && mkdir logs \
    && userdel -r node && rm -rf /home/node && groupadd -g 1000 jukebox && useradd -u 1000 -g jukebox -m -s /usr/sbin/nologin jukebox

# Copy needed files
COPY --from=build-stage --chown=jukebox /tmp/build/package.json .
COPY --from=build-stage --chown=jukebox /tmp/build/package-lock.json .
COPY --from=build-stage --chown=jukebox /tmp/build/node_modules ./node_modules
COPY --from=build-stage --chown=jukebox /tmp/build/dist ./dist
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Mark cache folder as docker volume
VOLUME ["/app/cache", "/app/logs"]

# Execute entrypoint
ENTRYPOINT ["/bin/sh", "/docker-entrypoint.sh"]

# Start the app with node
CMD ["node", "--experimental-specifier-resolution=node", "dist/main.js"]
