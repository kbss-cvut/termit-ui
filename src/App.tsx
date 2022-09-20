import * as React from "react";
import { Provider } from "react-redux";
import TermItStore from "./store/TermItStore";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import IntlApp from "./IntlApp";
import keycloak from "./util/Keycloak";
import SecurityUtils from "./util/SecurityUtils";
import IntlAppKeycloak from "./IntlAppKeycloak";

const App: React.FC = () => {
  if (process.env.REACT_APP_AUTHENTICATION === "keycloak") {
    return (
      <ReactKeycloakProvider
        authClient={keycloak}
        onTokens={SecurityUtils.tokenSaver}
      >
        <Provider store={TermItStore}>
          <IntlAppKeycloak />
        </Provider>
      </ReactKeycloakProvider>
    );
  } else {
    return (
      <Provider store={TermItStore}>
        <IntlApp />
      </Provider>
    );
  }
};

export default App;
