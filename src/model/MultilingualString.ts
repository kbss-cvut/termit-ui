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

export function getLocalized(str: MultilingualString | string, lang: string = Constants.DEFAULT_LANGUAGE) {
    if (typeof str === "string") {
        return str;
    }
    lang = lang.toLowerCase();
    if (str[lang] !== undefined) {
        return str[lang];
    } else if (str[Constants.DEFAULT_LANGUAGE]) {
        return str[Constants.DEFAULT_LANGUAGE]
    }
    return str[NO_LANG] !== undefined ? str[NO_LANG] : str[Object.getOwnPropertyNames(str)[0]];
}

export default MultilingualString;
