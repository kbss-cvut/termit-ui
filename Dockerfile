# BASE STAGE
# Prepare node, copy package.json
FROM node:14 AS base
WORKDIR /usr/src/app
COPY package.json package-lock.json ./

# DEPENDENCIES STAGE
# Install production and dev dependencies
FROM base AS dependencies
# install node packages
RUN npm set progress=false && npm config set depth 0
RUN npm ci

# TEST STAGE
# run linters, setup and tests
FROM dependencies AS test
COPY . .
RUN  npm run test-ci

# BUILD STAGE
# run NPM build
FROM test as build

ARG REACT_APP_ADMIN_REGISTRATION_ONLY=false
ARG REACT_APP_SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED=false
ARG REACT_APP_GOOGLE_LOGIN=false
ARG REACT_APP_GITHUB_LOGIN=false

RUN set -ex; \
  REACT_APP_ADMIN_REGISTRATION_ONLY=${REACT_APP_ADMIN_REGISTRATION_ONLY} REACT_APP_SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED=${REACT_APP_SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED} REACT_APP_GOOGLE_LOGIN=${REACT_APP_GOOGLE_LOGIN} REACT_APP_GITHUB_LOGIN=${REACT_APP_GITHUB_LOGIN} npm run build

# RELEASE STAGE
# Only include the static files in the final image
FROM docker.pkg.github.com/opendata-mvcr/react-nginx/react-nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=build /usr/src/app/build/ ./
RUN chmod a+r -R .
RUN chmod ag+x ./flags
RUN chmod ag+x ./background
