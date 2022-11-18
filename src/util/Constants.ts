import Routes from "./Routes";
import {
  setProcessEnv,
  getEnvInstance,
} from "@opendata-mvcr/assembly-line-shared";

setProcessEnv(process.env);
const env = getEnvInstance();
const COMPONENTS = env.getComponents();

export const getEnv = (key: string, defaultValue?: string): string => {
  return env.get(key, defaultValue);
};

const API_PREFIX = "/rest";
const DEFAULT_LANGUAGE = "en";

const constants = {
  // Will be replaced with actual server url during build
  SERVER_URL: COMPONENTS["al-termit-server"].url,
  // Prefix of the server REST API
  API_PREFIX,
  PUBLIC_API_PREFIX: `${API_PREFIX}/public`,
  APP_NAME: "TermIt",
  // Will be replaced with actual version during build
  VERSION: env.get("VERSION", "unknown"),
  // Will be replaced with actual deployment name during build
  DEPLOYMENT_NAME: getEnv("CONTEXT"),
  HOME_ROUTE: Routes.dashboard,
  LANG: {
    CS: {
      locale: "cs-CZ",
      label: "Čestina",
      flag: "flags/cz.svg",
    },
    EN: {
      locale: DEFAULT_LANGUAGE,
      label: "English",
      flag: "flags/gb.svg",
    },
  },
  DEFAULT_LANGUAGE,
  // Error origin caused by the inability to connect to the backend server
  CONNECTION_ERROR: "CONNECTION_ERROR",
  JSON_MIME_TYPE: "application/json",
  JSON_LD_MIME_TYPE: "application/ld+json",
  TEXT_MIME_TYPE: "text/plain",
  HTML_MIME_TYPE: "text/html",
  CSV_MIME_TYPE: "text/csv",
  TTL_MIME_TYPE: "text/turtle",
  EXCEL_MIME_TYPE:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  X_WWW_FORM_URLENCODED: "application/x-www-form-urlencoded;charset=UTF-8",
  MULTIPART_FORM_DATA: "multipart/form-data",
  // HTTP response status 401 Unauthorized
  STATUS_UNAUTHORIZED: 401,
  // HTTP response status 409 Conflict
  STATUS_CONFLICT: 409,
  // Axios uses lower case for header names
  Headers: {
    ACCEPT: "accept",
    AUTHORIZATION: "authorization",
    CONTENT_DISPOSITION: "content-disposition",
    CONTENT_TYPE: "content-type",
    IF_MODIFIED_SINCE: "if-modified-since",
    LAST_MODIFIED: "last-modified",
    LOCATION: "location",
    X_TOTAL_COUNT: "x-total-count",
  },
  STORAGE_JWT_KEY: "",
  STORAGE_LANG_KEY: "",
  STORAGE_TABLE_PAGE_SIZE_KEY: "",
  STORAGE_ANNOTATOR_LEGEND_OPEN_KEY: "",
  // How many messages should be displayed at one moment
  MESSAGE_DISPLAY_COUNT: 5,
  // For how long should a message be displayed
  MESSAGE_DISPLAY_TIMEOUT: 5000,
  MARKDOWN_EDITOR_HEIGHT: "200px",

  // News
  NEWS_MD_URL: {
    cs: window.location.origin + window.location.pathname + "NEWS.cs.md",
    en: window.location.origin + window.location.pathname + "NEWS.en.md",
  },

  // Wallpaper: ~60% color saturation + some blur (~4px radius) + JPEG compression to <150KB.
  // LAYOUT_WALLPAPER: null,
  // LAYOUT_WALLPAPER: "/background/Magnetic_Termite_Mounds.small-blur.jpg",
  // LAYOUT_WALLPAPER_POSITION: "center center", // CSS background-position property
  LAYOUT_WALLPAPER:
    "background/people-on-the-bridge-with-cityscape-in-prague-czech-republic.small-blur.jpg",

  // Navbar background when LAYOUT_WALLPAPER is in use
  LAYOUT_WALLPAPER_NAVBAR_BACKGROUND_IS_LIGHT: false,
  LAYOUT_WALLPAPER_NAVBAR_BACKGROUND: "rgba(0,0,0,0.2)",

  EMPTY_ASSET_IRI: "http://empty",
  LAST_COMMENTED_ASSET_LIMIT: 5,
  ANNOTATOR_TUTORIAL: {},
  WORKSPACE_EDITABLE_CONTEXT_PARAM: "vocabulary",

  DEFAULT_TERM_SELECTOR_FETCH_SIZE: 100,
};

constants.ANNOTATOR_TUTORIAL[constants.LANG.CS.locale] =
  "https://kbss-cvut.github.io/termit-web/cs/tutorial#anotace-dokumentů";
constants.ANNOTATOR_TUTORIAL[constants.LANG.EN.locale] =
  "https://kbss-cvut.github.io/termit-web/tutorial#annotate-documents";

const deployment =
  constants.DEPLOYMENT_NAME.length > 0 ? constants.DEPLOYMENT_NAME + "-" : "";
constants.STORAGE_JWT_KEY = `${constants.APP_NAME}-${deployment}${constants.Headers.AUTHORIZATION}`;
constants.STORAGE_LANG_KEY = `${constants.APP_NAME}-${deployment}LANG`;
constants.STORAGE_TABLE_PAGE_SIZE_KEY = `${constants.APP_NAME}-${deployment}TABLE_PAGE_SIZE`;
constants.STORAGE_ANNOTATOR_LEGEND_OPEN_KEY = `${constants.APP_NAME}-${deployment}ANNOTATOR_LEGEND_OPEN`;

export default constants;
