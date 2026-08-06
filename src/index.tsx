import * as ReactDOM from "react-dom";
import App from "./App";
import "./index.scss";
import * as serviceWorker from "./serviceWorker";
import TimeAgo from "javascript-time-ago";
import timeagoEn from "javascript-time-ago/locale/en";
import timeagoCs from "javascript-time-ago/locale/cs";
import timeagoDe from "javascript-time-ago/locale/de";
import { setUseWhatChange } from "@simbathesailor/use-what-changed";

// Load locales for the TimeAgo library
TimeAgo.addLocale(timeagoEn);
TimeAgo.addLocale(timeagoCs);
TimeAgo.addLocale(timeagoDe);

setUseWhatChange(process.env.NODE_ENV === "development");

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);

serviceWorker.unregister();
