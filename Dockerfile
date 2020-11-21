FROM node:14 as react-build
ARG SERVER_URL=http://localhost:8080/termit

WORKDIR /frontend
COPY . .
RUN npm install
ENV PATH $WORKDIR/node_modules/.bin:$PATH
RUN serverUrl=${SERVER_URL} deployment=docker npm run build-prod

FROM nginx:alpine
COPY --from=react-build /frontend/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]