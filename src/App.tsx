import * as React from "react";
import { Provider } from "react-redux";
import TermItStore from "./store/TermItStore";
import IntlApp from "./IntlApp";
import { setProcessEnv, Auth } from "@opendata-mvcr/assembly-line-shared";

setProcessEnv(process.env);

const App: React.FC = () => {
  return (
    <Auth>
      <Provider store={TermItStore}>
        <IntlApp />
      </Provider>
    </Auth>
  );
};

export default App;
