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
ARG PUBLIC_PATH=/
ARG REACT_APP_SERVER_URL=/
ARG SERVER_URL=http://localhost:8080/termit
ARG DEPLOYMENT=dev
ARG REACT_APP_ADMIN_REGISTRATION_ONLY=false
ARG REACT_APP_SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED=false
ARG REACT_APP_GOOGLE_LOGIN=false
ARG REACT_APP_GITHUB_LOGIN=false

# Make sure that React app is built using the right path context
ENV PUBLIC_URL=${PUBLIC_PATH}
ENV REACT_APP_SERVER_URL=${REACT_APP_SERVER_URL}
ENV REACT_APP_ADMIN_REGISTRATION_ONLY=${REACT_APP_ADMIN_REGISTRATION_ONLY}
ENV REACT_APP_SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED=${REACT_APP_SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED}
ENV REACT_APP_GOOGLE_LOGIN=${REACT_APP_GOOGLE_LOGIN}
ENV REACT_APP_GITHUB_LOGIN=${REACT_APP_GITHUB_LOGIN}
RUN set -ex; \
  npm run build
# RELEASE STAGE
# Only include the static files in the final image
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
RUN chmod a+r -R /usr/share/nginx/html
RUN chmod ag+x /usr/share/nginx/html/flags
RUN chmod ag+x /usr/share/nginx/html/background