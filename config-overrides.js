module.exports = function override(config, env) {
  config.resolve.alias = {
    ...config.resolve.alias,
    // resolves problem with react-stomp-hooks lib
    // https://stackoverflow.com/questions/70964723/webpack-5-in-ceate-react-app-cant-resolve-not-fully-specified-routes
    "react/jsx-runtime": "react/jsx-runtime.js",
  };

  return config;
};
