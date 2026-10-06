# BASE STAGE
# Prepare node, copy package.json
FROM node:24-alpine AS base
WORKDIR /usr/src/app
COPY package.json package-lock.json ./

# DEPENDENCIES STAGE
# Install production and dev dependencies
FROM base AS dependencies
# install node packages with scripts disabled to neutralise malicious postinstall hooks
RUN npm ci --ignore-scripts

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
FROM nginx:alpine

# Make env var substitution happen on *.template files in the html dir
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/usr/share/nginx/html \
    NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html

# Define selected dynamic configuration variables so envsubst replaces them
# even when they are not provided at runtime (with an empty value by default).
ENV ADMIN_REGISTRATION_ONLY="true" \
    SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED="true" \
    DISABLE_PUBLIC_VIEW="false" \
    AUTHENTICATION="" \
    AUTH_SERVER_URL="" \
    AUTH_CLIENT_ID="" \
    AUTH_SERVER_MANAGEMENT="" \
    AUTH_SERVER_USER_PROFILE="" \
    BANNER="" \
    BANNER_TOOLTIP=""

COPY --from=build --chown=nginx:nginx --chmod=755 /usr/src/app/build /usr/share/nginx/html

# Hardening:
#  - allow the unprivileged nginx user to bind port 80 via file capability
#  - make every path nginx (master + workers + entrypoint scripts) writes to owned by the nginx user
#  - strip all setuid/setgid bits from the filesystem to eliminate local privilege escalation vectors
#  - remove package manager metadata and the libcap toolchain after use
RUN set -eux; \
    apk add --no-cache --virtual .setcap libcap; \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx; \
    apk del .setcap; \
    # Writable runtime dirs/files for a non-root master process
    install -d -o nginx -g nginx -m 0755 /var/cache/nginx /var/run; \
    install -o nginx -g nginx -m 0644 /dev/null /var/run/nginx.pid; \
    chown -R nginx:nginx /etc/nginx/conf.d /usr/share/nginx/html; \
    # Drop suid/sgid bits everywhere
    find / -xdev -type f \( -perm -4000 -o -perm -2000 \) -exec chmod a-s {} +; \
    # Trim package metadata
    rm -rf /var/cache/apk/* /tmp/* /root/.cache

EXPOSE 80
STOPSIGNAL SIGQUIT
USER nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/ || exit 1
