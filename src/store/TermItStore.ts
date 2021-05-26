import { applyMiddleware, createStore, Middleware } from "redux";
import { createLogger } from "redux-logger";
import thunk, { ThunkMiddleware } from "redux-thunk";
import TermItReducers from "../reducer/TermItReducers";
import { composeWithDevTools } from "redux-devtools-extension";
import TermItState from "../model/TermItState";

const middlewares: Middleware[] = [thunk as ThunkMiddleware];

if (process.env.NODE_ENV === "development") {
  middlewares.push(
    createLogger({
      stateTransformer(state: TermItState): any {
        return TermItState.toLoggable(state);
      },
    })
  );
}

const TermItStore = createStore(
  TermItReducers,
  composeWithDevTools(applyMiddleware(...middlewares))
);

export default TermItStore;
