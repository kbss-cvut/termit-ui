import * as React from "react";
import { Provider } from "react-redux";
import TermItStore from "./store/TermItStore";
import IntlApp from "./IntlApp";
import { isUsingOidcAuth } from "./util/OidcUtils";
import OidcIntlApp from "./OidcIntlApp";
import { WebSocketWrapper } from "./WebSocketApp";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {isUsingOidcAuth() ? (
        <Provider store={TermItStore}>
          <WebSocketWrapper>
            <OidcIntlApp />
          </WebSocketWrapper>
        </Provider>
      ) : (
        <Provider store={TermItStore}>
          <WebSocketWrapper>
            <IntlApp />
          </WebSocketWrapper>
        </Provider>
      )}
    </QueryClientProvider>
  );
};

export default App;
