import Constants from "./Constants";
import IntlData from "../model/IntlData";
import BrowserStorage from "./BrowserStorage";

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
