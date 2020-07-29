import * as React from "react";
import {Provider} from "react-redux";
import TermItStore from "./store/TermItStore";
import IntlApp from "./IntlApp";

const App: React.FC = () => {
    return <Provider store={TermItStore}>
            <IntlApp/>
        </Provider>;
};

export default App;
