import * as ReactDOM from "react-dom";
import App from "./App";
import "./index.scss";
import * as serviceWorker from "./serviceWorker";
import TimeAgo from "javascript-time-ago";
import timeagoEn from "javascript-time-ago/locale/en";
import tiemagoCs from "javascript-time-ago/locale/cs";

// @ts-ignore
if (!Intl.PluralRules) {
  // @ts-ignore
  import("@formatjs/intl-pluralrules/polyfill");
  // @ts-ignore
  import("@formatjs/intl-pluralrules/locale-data/en"); // Add locale data for en
  // @ts-ignore
  import("@formatjs/intl-pluralrules/locale-data/cs"); // Add locale data for cs
}

// @ts-ignore
if (!Intl.RelativeTimeFormat) {
  // @ts-ignore
  import("@formatjs/intl-relativetimeformat/polyfill");
  // @ts-ignore
  import("@formatjs/intl-relativetimeformat/locale-data/en"); // Add locale data for en
  // @ts-ignore
  import("@formatjs/intl-relativetimeformat/locale-data/cs"); // Add locale data for xs
}

// Load locales for the TimeAgo library
TimeAgo.addLocale(timeagoEn);
TimeAgo.addLocale(tiemagoCs);

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);

serviceWorker.unregister();
