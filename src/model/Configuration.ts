import Constants from "../util/Constants";
import UserRole, { CONTEXT as USERROLE_CONTEXT } from "./UserRole";
import VocabularyUtils from "../util/VocabularyUtils";

const ctx = {
  iri: "@id",
  language: `${VocabularyUtils.DC_LANGUAGE}`,
  roles: `${VocabularyUtils.NS_TERMIT}má-uživatelskou-roli`,
  maxFileUploadSize: `${VocabularyUtils.NS_TERMIT}má-maximální-velikost-souboru`,
  versionSeparator: `${VocabularyUtils.NS_TERMIT}má-oddělovač-verze`,
};

export const CONTEXT = Object.assign({}, USERROLE_CONTEXT, ctx);

/**
 * Represents configuration data provided by the server.
 */
export interface Configuration {
  iri: string;
  language: string;
  roles: UserRole[];
  maxFileUploadSize: string;
  versionSeparator: string;
}

export const DEFAULT_CONFIGURATION: Configuration = {
  iri: "",
  language: Constants.DEFAULT_LANGUAGE,
  roles: [],
  maxFileUploadSize: "",
  versionSeparator: "",
};
