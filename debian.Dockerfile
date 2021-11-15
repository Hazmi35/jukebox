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

# Install python3 (required for youtube-dl/yt-dlp)
RUN apt-get update \
    && apt-get install -y python-is-python3 \
    && apt-get autoremove -y \
    && apt-get autoclean -y \
    && rm -rf /var/lib/apt/lists/*

# Copy needed files
COPY --from=build-stage /tmp/build/package.json .
COPY --from=build-stage /tmp/build/package-lock.json .
COPY --from=build-stage /tmp/build/node_modules ./node_modules
COPY --from=build-stage /tmp/build/dist ./dist

# Mark cache folder as docker volume
VOLUME ["/app/cache", "/app/logs"]

# Start the app with node
CMD ["node", "dist/main.js"]
