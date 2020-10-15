import Constants from "../util/Constants";

export function context(propertyIri: string) {
    return {
        "@id": propertyIri,
        "@container": "@language"
    };
}

interface MultilingualString {
    [key: string]: string;
}

/**
 * Indicates a string without language tag.
 */
export const NO_LANG = "@none";

export function langString(str: string, lang: string = Constants.DEFAULT_LANGUAGE): MultilingualString {
    const result = {};
    result[lang] = str;
    return result;
}

/**
 * Gets value in the specified language from the specified string.
 *
 * If such translation is not available, this method attempts to get the value in the configured default language, no
 * language. If all of these fail, the first available translation is returned.
 *
 * If the argument is a regular string, it is immediately returned.
 * @param str String to get localized value from
 * @param lang Target language
 */
export function getLocalized(str?: MultilingualString | string, lang: string = Constants.DEFAULT_LANGUAGE) {
    if (typeof str === "string") {
        return str;
    }
    if (!str) {
        return "";
    }
    lang = lang.toLowerCase();
    if (str[lang] !== undefined) {
        return str[lang];
    } else if (str[Constants.DEFAULT_LANGUAGE]) {
        return str[Constants.DEFAULT_LANGUAGE]
    }
    return str[NO_LANG] !== undefined ? str[NO_LANG] : str[Object.getOwnPropertyNames(str)[0]];
}

/**
 * Gets value in the specified language from the specified string.
 *
 * If such transformation is not available, the provided default value is returned.
 *
 * If the argument is a regular string, it is immediately returned.
 * @param str String to get localized value from
 * @param defaultValue Value to return if translation is not available
 * @param lang Target language
 */
export function getLocalizedOrDefault(str?: MultilingualString | string, defaultValue: string = "", lang: string = Constants.DEFAULT_LANGUAGE) {
    if (typeof str === "string") {
        return str;
    }
    if (!str) {
        return "";
    }
    lang = lang.toLowerCase();
    return str[lang] !== undefined ? str[lang] : str[NO_LANG] !== undefined ? str[NO_LANG] : defaultValue;
}

export default MultilingualString;
