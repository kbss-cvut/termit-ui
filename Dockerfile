FROM node:14 as react-build
ARG SERVER_URL=http://localhost:8080/termit
ARG DEPLOYMENT=dev
ARG REACT_APP_ADMIN_REGISTRATION_ONLY=false
ARG REACT_APP_SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED=false
ARG REACT_APP_GOOGLE_LOGIN=false
ARG REACT_APP_GITHUB_LOGIN=false

WORKDIR /frontend
COPY . .
RUN npm install
ENV PATH $WORKDIR/node_modules/.bin:$PATH
RUN serverUrl=${SERVER_URL} deployment=${DEPLOYMENT} REACT_APP_ADMIN_REGISTRATION_ONLY=${REACT_APP_ADMIN_REGISTRATION_ONLY} REACT_APP_SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED=${REACT_APP_SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED} REACT_APP_GOOGLE_LOGIN=${REACT_APP_GOOGLE_LOGIN} REACT_APP_GITHUB_LOGIN=${REACT_APP_GITHUB_LOGIN} npm run build-prod

FROM nginx:alpine
COPY --from=react-build /frontend/build /usr/share/nginx/html
RUN chmod a+r -R /usr/share/nginx/html
RUN chmod ag+x /usr/share/nginx/html/flags

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]