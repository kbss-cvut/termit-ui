# BASE STAGE
# Prepare node, copy package.json
FROM node:14 AS base
WORKDIR /usr/src/app
COPY package.json package-lock.json ./

# DEPENDENCIES STAGE
# Install production and dev dependencies
FROM base AS dependencies
# install node packages
#RUN npm set progress=false && npm config set depth 0
RUN npm install

# TEST STAGE
# run linters, setup and tests
FROM dependencies AS test
COPY . .
RUN  npm run prettier:check

# BUILD STAGE
# run NPM build
FROM test as build
# If an app is supposed to be deployed in a subdir, this is the place to specify that
# Make sure that React app is built using the right path context
RUN set -ex; \
  npm run build

# RELEASE STAGE
# Only include the static files in the final image
FROM nginx
COPY --from=build /usr/src/app/build /usr/share/nginx/html
# Make env var substitution happen on *.template files in the html dir
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/usr/share/nginx/html
ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html