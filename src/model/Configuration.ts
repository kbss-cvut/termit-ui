import Constants from "../util/Constants";
import UserRole from "./UserRole";
import VocabularyUtils from "../util/VocabularyUtils";
import {CONTEXT as USERROLE_CONTEXT} from "./UserRole";

const ctx = {
    iri: "@id",
    language: `${VocabularyUtils.DC_LANGUAGE}`,
    roles: `${VocabularyUtils.NS_TERMIT}má-uživatelskou-roli`
};

export const CONTEXT = Object.assign({}, USERROLE_CONTEXT, ctx);

/**
 * Represents configuration data provided by the server.
 */
export interface Configuration {
    iri: string;
    language: string;
    roles: UserRole[];
}

export const DEFAULT_CONFIGURATION: Configuration = {
    iri: "",
    language: Constants.DEFAULT_LANGUAGE,
    roles: []
};
