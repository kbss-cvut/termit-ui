import * as React from "react";
import { Provider } from "react-redux";
import TermItStore from "./store/TermItStore";
import IntlApp from "./IntlApp";
import OidcAuthWrapper from "./component/misc/oidc/OidcAuthWrapper";
import { useOidcAuth } from "./util/OidcUtils";

const App: React.FC = () => {
  if (useOidcAuth()) {
    return (
      <OidcAuthWrapper>
        <Provider store={TermItStore}>
          <IntlApp />
        </Provider>
      </OidcAuthWrapper>
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
