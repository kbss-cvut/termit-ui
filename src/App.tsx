import * as React from "react";
import {Provider} from "react-redux";
import TermItStore from "./store/TermItStore";
import IntlApp from "./IntlApp";
import {ReactKeycloakProvider} from "@react-keycloak/web";
import keycloak from "./util/Keycloak";
import Authentication from "./util/Authentication";

const eventLogger = (event: unknown, error: unknown) => {
    // @ts-ignore
    console.log("onKeycloakEvent", event, error)
}

const tokenLogger = (tokens: unknown) => {
    Authentication.saveToken((tokens as any).token);
}

const App: React.FC = () => {
    return <ReactKeycloakProvider authClient={keycloak} onEvent={eventLogger} onTokens={tokenLogger}>
        <Provider store={TermItStore}>
            <IntlApp/>
        </Provider>
    </ReactKeycloakProvider>;
};

export default App;
