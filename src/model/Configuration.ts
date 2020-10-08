import Constants from "../util/Constants";

/**
 * Represents configuration data provided by the server.
 */
export interface Configuration {
    language: string;
}

export const DEFAULT_CONFIGURATION: Configuration = {
    language: Constants.DEFAULT_LANGUAGE
};
