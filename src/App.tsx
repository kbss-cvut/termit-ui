import * as React from "react";
import { Provider } from "react-redux";
import TermItStore from "./store/TermItStore";
import IntlApp from "./IntlApp";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { AuthClientTokens } from "@react-keycloak/core";
import keycloak from "./util/Keycloak";
import Authentication from "./util/Authentication";

const tokenSaver = (tokens: AuthClientTokens) => {
  if (tokens.token) {
    Authentication.saveToken(tokens.token);
  }
};

const App: React.FC = () => {
  return (
    <ReactKeycloakProvider authClient={keycloak} onTokens={tokenSaver}>
      <Provider store={TermItStore}>
        <IntlApp />
      </Provider>
    </ReactKeycloakProvider>
  );
};

export default App;
