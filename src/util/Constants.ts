import YAML from 'yaml'
import Routes from "./Routes";

type Component<T = {}> = {
    name: string
    url: string
    meta: T
}
  
 type Components = {
    sgovServer: Component
    dbServer: Component
    authServer: Component
    ontographer: Component<{ workspacePath: string }>
    termitServer: Component
    termit: Component<{ workspacePath: string }>
    missionControl: Component
    issueTracker: Component<{ newBug: string; newFeature: string }>
}

/**
 * Aggregated object of process.env and window.__config__ to allow dynamic configuration
 */
const ENV = {
    ...Object.keys(process.env).reduce<Record<string, string>>((acc, key) => {
        const strippedKey = key.replace("REACT_APP_", "")
        acc[strippedKey] = process.env[key]!
        return acc
    }, {}),
    ...(window as any).__config__,
}

/**
 * Helper to make sure that all envs are defined properly
 * @param name env variable name
 * @param defaultValue Default variable name
 */
const getEnv = (name: string, defaultValue?: string): string => {
    const value = ENV[name] || defaultValue
    if (value) {
        return value
    }
    throw new Error(`Missing environment variable: ${name}`)
}

/**
 * Components configuration
 */
const COMPONENTS: Components = (() => {
    const base64String = getEnv("COMPONENTS")
    try {
        // Use TextDecoder interface to properly decode UTF-8 characters
        const yamlString = new TextDecoder("utf-8").decode(
            Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0))
        )
        return YAML.parse(yamlString)
    } catch (error: any) {
        throw new Error("Unable to decode COMPONENTS configuration. Error: " + error);
    }
})()

const APP_NAME = "TermIt";
const API_PREFIX = "/rest";
const DEFAULT_LANGUAGE = "en";
const DEPLOYMENT_NAME = getEnv("CONTEXT");
const DEPLOYMENT_INFIX = DEPLOYMENT_NAME.length > 0 ? DEPLOYMENT_NAME + "-" : "";
const AUTHORIZATION = "authorization";

const constants = {
    // Will be replaced with actual server url during runtime
    ID: getEnv("ID"),
    // Will be replaced with actual server url during runtime
    COMPONENTS,
    // Will be replaced with actual server url during runtime
    SERVER_URL: COMPONENTS.termitServer.url,
    // Will be replaced with actual control panel url during runtime
    CONTROL_PANEL_URL: COMPONENTS.missionControl.url,
    // Prefix of the server REST API
    API_PREFIX,
    PUBLIC_API_PREFIX: `${API_PREFIX}/public`,
    APP_NAME,
    // Will be replaced with actual version during build
    VERSION: getEnv("VERSION"),
    // Will be replaced with actual deployment name during runtime
    DEPLOYMENT_NAME,
    HOME_ROUTE: Routes.dashboard,
    LANG: {
        CS: {
            locale: "cs-CZ",
            label: "Čestina",
            flag: "flags/cz.svg"
        },
        EN: {
            locale: DEFAULT_LANGUAGE,
            label: "English",
            flag: "flags/gb.svg"
        }
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
    EXCEL_MIME_TYPE: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    X_WWW_FORM_URLENCODED: "application/x-www-form-urlencoded",
    MULTIPART_FORM_DATA: "multipart/form-data",
    // HTTP response status 401 Unauthorized
    STATUS_UNAUTHORIZED: 401,
    // HTTP response status 409 Conflict
    STATUS_CONFLICT: 409,
    // HTTP response status 404 Not found
    STATUS_NOT_FOUND: 404,
    // Axios uses lower case for header names
    Headers: {
        ACCEPT: "accept",
        AUTHORIZATION,
        CONTENT_DISPOSITION: "content-disposition",
        CONTENT_TYPE: "content-type",
        IF_MODIFIED_SINCE: "if-modified-since",
        LAST_MODIFIED: "last-modified",
        LOCATION: "location"
    },
    STORAGE_JWT_KEY: `${APP_NAME}-${DEPLOYMENT_INFIX}${AUTHORIZATION}`,
    STORAGE_LANG_KEY: `${APP_NAME}-${DEPLOYMENT_INFIX}LANG`,
    STORAGE_PARENT_SELECTOR_RANGE: `${APP_NAME}-${DEPLOYMENT_INFIX}PARENT_SELECTOR_RANGE`,
    STORAGE_TABLE_PAGE_SIZE_KEY: `${APP_NAME}-${DEPLOYMENT_INFIX}TABLE_PAGE_SIZE`,
    // How many messages should be displayed at one moment
    MESSAGE_DISPLAY_COUNT: 5,
    // For how long should a message be displayed
    MESSAGE_DISPLAY_TIMEOUT: 5000,

    // News
    NEWS_MD_URL: {
        "cs": window.location.origin + window.location.pathname + "NEWS.cs.md",
        "en": window.location.origin + window.location.pathname + "NEWS.en.md",
    },

    // Wallpaper: ~60% color saturation + some blur (~4px radius) + JPEG compression to <150KB.
    // LAYOUT_WALLPAPER: null,
    // LAYOUT_WALLPAPER: "/background/Magnetic_Termite_Mounds.small-blur.jpg",
    // LAYOUT_WALLPAPER_POSITION: "center center", // CSS background-position property
    LAYOUT_WALLPAPER: "background/people-on-the-bridge-with-cityscape-in-prague-czech-republic.small-blur.jpg",

    // Navbar background when LAYOUT_WALLPAPER is in use
    LAYOUT_WALLPAPER_NAVBAR_BACKGROUND_IS_LIGHT: false,
    LAYOUT_WALLPAPER_NAVBAR_BACKGROUND: "rgba(0,0,0,0.2)",

    EMPTY_ASSET_IRI: "http://empty",

    SUBMIT_BUTTON_VARIANT: "primary",
    CANCEL_BUTTON_VARIANT: "outline-primary"
} as const;

export default constants;
