import Constants from "../util/Constants";
import Utils from "../util/Utils";
import { getShortLocale } from "../util/IntlUtil";

export function context(propertyIri: string) {
    return {
        "@id": propertyIri,
        "@container": "@language",
    };
}

export interface MultilingualString {
    [key: string]: string;
}

export interface PluralMultilingualString {
    [key: string]: string[];
}

/**
 * Indicates a string without language tag.
 */
export const NO_LANG = "@none";

/**
 * Creates a MultilingualString instance from the specifies string and language.
 * @param str String to use as value
 * @param lang Language (optional), defaults to Constants.DEFAULT_LANGUAGE
 */
export function langString(
    str: string,
    lang: string = Constants.DEFAULT_LANGUAGE
): MultilingualString {
    const result = {};
    result[lang] = str;
    return result;
}

/**
 * Creates a PluralMultilingualString instance from the specifies string(s) and language.
 * @param str String or string array to use as value (will always be transformed to an array)
 * @param lang Language (optional), defaults to Constants.DEFAULT_LANGUAGE
 */
export function pluralLangString(
    str: string | string[],
    lang: string = Constants.DEFAULT_LANGUAGE
): PluralMultilingualString {
    const result = {};
    result[lang] = Utils.sanitizeArray(str);
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
export function getLocalized(
    str?: MultilingualString | string,
    lang: string = Constants.DEFAULT_LANGUAGE
) {
    if (typeof str === "string") {
        return str;
    }
    if (!str) {
        return "";
    }
    lang = lang.toLowerCase();
    if (str[lang] !== undefined) {
        return str[lang];
    } else if (str[getShortLocale(lang)] !== undefined) {
        return str[getShortLocale(lang)];
    } else if (str[Constants.DEFAULT_LANGUAGE]) {
        return str[Constants.DEFAULT_LANGUAGE];
    }
    return str[NO_LANG] !== undefined
        ? str[NO_LANG]
        : str[Object.getOwnPropertyNames(str)[0]];
}

/**
 * Gets value in the specified language from the specified plural string.
 *
 * If such translation is not available, this method attempts to get the value with no language (@none). If both of
 * these fail, an empty array is returned.
 *
 * @param str String to get localized value from
 * @param lang Target language
 */
export function getLocalizedPlural(
    str?: PluralMultilingualString,
    lang: string = Constants.DEFAULT_LANGUAGE
) {
    if (!str) {
        return [];
    }
    lang = lang.toLowerCase();
    if (str[lang] !== undefined) {
        return Utils.sanitizeArray(str[lang]);
    }
    return str[NO_LANG] !== undefined ? Utils.sanitizeArray(str[NO_LANG]) : [];
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
export function getLocalizedOrDefault(
    str?: MultilingualString | string,
    defaultValue: string = "",
    lang: string = Constants.DEFAULT_LANGUAGE
) {
    if (typeof str === "string") {
        return str;
    }
    if (!str) {
        return "";
    }
    lang = lang.toLowerCase();
    return str[lang] !== undefined
        ? str[lang]
        : str[NO_LANG] !== undefined
        ? str[NO_LANG]
        : defaultValue;
}

export default MultilingualString;
