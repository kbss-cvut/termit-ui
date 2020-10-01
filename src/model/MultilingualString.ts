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

export default MultilingualString;
