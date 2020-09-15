FROM node:latest as react-build
ARG SERVER_URL=http://localhost:8080/termit
RUN test -n "$SERVER_URL"
WORKDIR /frontend
COPY . .
RUN echo "{ \"url\": \"$SERVER_URL\" }" > config/server.json
RUN npm install --silent
ENV PATH $WORKDIR/node_modules/.bin:$PATH
RUN npm run-script build-prod

FROM nginx:alpine
COPY --from=react-build /frontend/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]