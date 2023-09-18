import * as React from "react";
import { Provider } from "react-redux";
import TermItStore from "./store/TermItStore";
import IntlApp from "./IntlApp";
import { isUsingOidcAuth } from "./util/OidcUtils";
import OidcIntlApp from "./OidcIntlApp";

const App: React.FC = () => {
  if (isUsingOidcAuth()) {
    return (
      <Provider store={TermItStore}>
        <OidcIntlApp />
      </Provider>
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
