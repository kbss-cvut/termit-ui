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

export function toMultilingual(str: string) {
    const result = {};
    result[NO_LANG] = str;
    return result;
}

export function getLocalized(str: MultilingualString, locale: string = Constants.DEFAULT_LOCALE) {
    if (str[locale]) {
        return str[locale];
    } else if (str[Constants.DEFAULT_LOCALE]) {
        return str[Constants.DEFAULT_LOCALE]
    }
    return str[NO_LANG];
}

export default MultilingualString;
