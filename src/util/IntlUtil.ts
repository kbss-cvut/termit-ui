import Constants from "./Constants";
import IntlData from "../model/IntlData";
import BrowserStorage from "./BrowserStorage";
import Utils from "./Utils";
import ISO6391 from "iso-639-1";

export function loadInitialLocalizationData(): IntlData {
  const prefLang = BrowserStorage.get(Constants.STORAGE_LANG_KEY);
  const lang = prefLang ? prefLang : navigator.language;
  if (lang && (lang.startsWith("cs") || lang.startsWith("sk"))) {
    setHtmlLanguage(Constants.LANG.CS.locale);
    return loadLocalizationData(Constants.LANG.CS.locale);
  } else {
    return loadLocalizationData(Constants.LANG.EN.locale);
  }
}

export function loadLocalizationData(language: string): IntlData {
  switch (language) {
    case Constants.LANG.CS.locale:
      return require("../i18n/cs").default;
    default:
      return require("../i18n/en").default;
  }
}

export function saveLanguagePreference(language: string): void {
  BrowserStorage.set(Constants.STORAGE_LANG_KEY, language);
}

/**
 * Sets the "lang" attribute on the root HTML element.
 * @param language The language to set
 */
export function setHtmlLanguage(language: string): void {
  document.documentElement.lang = language;
}

export function getShortLocale(language: string): string {
  const i = language.indexOf("-");
  if (i > 0) {
    return language.substring(0, language.indexOf("-"));
  } else {
    return language;
  }
}

/**
 * Resolves unique languages in which the specified object has a value.
 *
 * The languages are resolved from the specified attributes.
 * @param multilingualAttributes Attributes to check
 * @param object Object to examine
 */
export function getLanguages(
  multilingualAttributes: string[],
  object?: any | null
) {
  if (!object) {
    return [];
  }
  const languages: Set<string> = new Set();
  multilingualAttributes
    .filter((att) => object[att])
    .forEach((att) => {
      Utils.sanitizeArray(object[att]).forEach((attValue) =>
        Object.getOwnPropertyNames(attValue).forEach((n) => languages.add(n))
      );
    });
  const langArr = Array.from(languages);
  langArr.sort();
  return langArr;
}

/**
 * Removes attribute values in the specified language.
 * @param multilingualAttributes Attributes whose values will be affected
 * @param object Object to process
 * @param language Language whose values to remove
 */
export function removeTranslation(
  multilingualAttributes: string[],
  object: any,
  language: string
) {
  multilingualAttributes.forEach((att) => {
    if (object[att]) {
      delete object[att][language];
    }
  });
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

function prioritizeLanguages(options: Language[], languages: string[]) {
  languages.forEach((lang) => {
    const ind = options.findIndex((v) => v.code === lang);
    const option = options[ind];
    options.splice(ind, 1);
    options.unshift(option);
  });
  return options;
}

const LANGUAGE_OPTIONS = prioritizeLanguages(
  ISO6391.getLanguages(ISO6391.getAllCodes()),
  Object.getOwnPropertyNames(Constants.LANG).map((lang) =>
    getShortLocale(Constants.LANG[lang].locale)
  )
);

export function getLanguageOptions(): Language[] {
  return LANGUAGE_OPTIONS;
}
