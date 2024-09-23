import * as React from "react";
import { Provider } from "react-redux";
import TermItStore from "./store/TermItStore";
import IntlApp from "./IntlApp";
import { isUsingOidcAuth } from "./util/OidcUtils";
import OidcIntlApp from "./OidcIntlApp";
import { WebSocketWrapper } from "./WebSocketApp";

const App: React.FC = () => {
  if (isUsingOidcAuth()) {
    return (
      <Provider store={TermItStore}>
        <WebSocketWrapper>
          <OidcIntlApp />
        </WebSocketWrapper>
      </Provider>
    );
  } else {
    return (
      <Provider store={TermItStore}>
        <WebSocketWrapper>
          <IntlApp />
        </WebSocketWrapper>
      </Provider>
    );
  }
};

export default App;
