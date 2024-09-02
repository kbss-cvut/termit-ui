module.exports = {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            // resolves https://stackoverflow.com/questions/70964723/webpack-5-in-ceate-react-app-cant-resolve-not-fully-specified-routes caused be react-stomp-hooks
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      },
    },
  },
};
