FROM node:14.16.0-alpine as build-stage

LABEL name "Jukebox (build stage)"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

WORKDIR /tmp/build

# Install node-gyp dependencies
RUN apk add --no-cache build-base git python3

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm install

# Copy Project files
COPY . .

# Build TypeScript Project
RUN npm run build

# Prune devDependencies
RUN npm prune --production

# Get ready for production
FROM node:14.16.0-alpine

LABEL name "Jukebox"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

WORKDIR /app

# Install dependencies
RUN apk add --no-cache tzdata

# Copy needed files
COPY --from=build-stage /tmp/build/package*.json .
COPY --from=build-stage /tmp/build/node_modules ./node_modules
COPY --from=build-stage /tmp/build/dist .

# Mark cache folder as docker volume
VOLUME ["/app/cache", "/app/logs"]

# Start the app with node
CMD ["node", "main.js"]