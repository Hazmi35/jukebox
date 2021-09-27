FROM hazmi35/node:16-dev-alpine as build-stage

LABEL name "Jukebox (build stage)"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Project files
COPY . .

# Build TypeScript Project
RUN npm run build

# Prune devDependencies
RUN npm prune --production

# Get ready for production
FROM hazmi35/node:16-alpine

LABEL name "Jukebox"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Install python3 (required for youtube-dl/yt-dlp)
RUN apk add --no-cache python3 && ln -s /usr/bin/python3 /usr/local/bin/python

# Copy needed files
COPY --from=build-stage /tmp/build/package.json .
COPY --from=build-stage /tmp/build/package-lock.json .
COPY --from=build-stage /tmp/build/node_modules ./node_modules
COPY --from=build-stage /tmp/build/dist ./dist

# Mark cache folder as docker volume
VOLUME ["/app/cache", "/app/logs"]

# Start the app with node
CMD ["node", "dist/main.js"]