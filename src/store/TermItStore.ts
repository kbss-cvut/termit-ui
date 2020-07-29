import {applyMiddleware, createStore} from "redux";
import {createLogger} from "redux-logger";
import thunk, {ThunkMiddleware} from "redux-thunk";
import TermItReducers from "../reducer/TermItReducers";
import {composeWithDevTools} from "redux-devtools-extension";

const loggerMiddleware = createLogger();

const TermItStore = createStore(
    TermItReducers,
    composeWithDevTools(
        applyMiddleware(thunk as ThunkMiddleware, loggerMiddleware)
    )
);

export default TermItStore;