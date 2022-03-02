# TermIt UI 
[![Netlify Status](https://api.netlify.com/api/v1/badges/a0f3b22c-93d8-4017-a5e5-0d4d531ebd94/deploy-status)](https://app.netlify.com/sites/termit-dev/deploys)

TermIt is an advanced terminology management tool compatible with [SKOS](https://www.w3.org/2004/02/skos/). This repository contains the frontend
of TermIt. Backend is written in Java and is developed separately (its repository can be found [here](https://github.com/kbss-cvut/termit)).

More info about TermIt can be found at its Web - [http://kbss-cvut.github.io/termit-web](http://kbss-cvut.github.io/termit-web).

TermIt UI is written in [TypeScript](https://www.typescriptlang.org/) using [React](https://reactjs.org/).

This project was bootstrapped with [Create React App](https://github.com/wmonk/create-react-app-typescript), TypeScript version.

## Documentation

Documentation for developers and system administrators is in the [doc folder](doc/index.md).

## Running TermIt UI

NodeJS and npm are required to build and run TermIt UI. To run the TermIt UI, it is necessary to provide a value for 
`REACT_APP_SERVER_URL` representing the URL of the backend to connect to. Typically, this is done at build time. 
See the documentation for more details and other configuration options.

### Dockerization

The docker image of TermIt UI can be built with `docker build -t termit-ui .`

Then, TermIt UI can be run and exposed at the port 3000 as 
`docker run -e SERVER_URL=<TERMIT_BACKEND_URL> -p 3000:80 termit-ui`
where `<TERMIT_BACKEND_URL>` denotes the URL where [TermIt backend](https://github.com/kbss-cvut/termit) is running.

## License

Licensed under GPL v3.0.
