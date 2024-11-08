# BASE STAGE
# Prepare node, copy package.json
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package.json package-lock.json ./

# DEPENDENCIES STAGE
# Install production and dev dependencies
FROM base AS dependencies
# install node packages
#RUN npm set progress=false && npm config set depth 0
RUN npm ci --legacy-peer-deps

# BUILD STAGE
# run NPM build
FROM dependencies AS build
# If an app is supposed to be deployed in a subdir, this is the place to specify that
# Make sure that React app is built using the right path context
COPY . .
RUN set -ex; \
  npm run build

# RELEASE STAGE
# Only include the static files in the final image
FROM nginx:1.25
COPY --from=build /usr/src/app/build /usr/share/nginx/html
# Make env var substitution happen on *.template files in the html dir
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/usr/share/nginx/html
ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html
RUN chmod a+r -R /usr/share/nginx/html
RUN chmod ag+x /usr/share/nginx/html/flags
RUN chmod ag+x /usr/share/nginx/html/background
