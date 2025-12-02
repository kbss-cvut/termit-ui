import SearchParam, { MatchType } from "../../../model/search/SearchParam";
import Utils from "../../../util/Utils";
import { RdfProperty } from "../../../model/RdfsResource";
import VocabularyUtils from "../../../util/VocabularyUtils";

/**
 * Aggregates search parameters into a list to be sent to the backend API, skipping empty and invalid parameters.
 * @param params Faceted search state
 * @returns List of search parameters for API call
 */
export function aggregateSearchParams(params: { [key: string]: SearchParam }) {
  return Object.entries(params)
    .map((e) => e[1])
    .filter((p) => {
      if (p.value.length > 0) {
        if (typeof p.value[0] === "string") {
          return p.matchType !== MatchType.IRI
            ? p.value[0].trim().length > 0
            : Utils.isUri(p.value[0].trim());
        }
        return p.value[0] !== undefined;
      }
      return false;
    });
}

/**
 * Creates a search parameter for the given attribute.
 * @param att Attribute to create search parameter for
 * @param value Existing value, if provided, it is returned
 * @param matchType Match type to override the default match type for the specified attribute
 */
export function createSearchParam(
  att: RdfProperty,
  value?: SearchParam,
  matchType?: MatchType
): SearchParam {
  if (value) {
    return value;
  }
  switch (att.rangeIri) {
    case VocabularyUtils.XSD_BOOLEAN:
      return {
        property: att.iri,
        matchType: matchType || MatchType.EXACT_MATCH,
        value: [],
      };
    case VocabularyUtils.XSD_INT:
      return {
        property: att.iri,
        matchType: matchType || MatchType.EXACT_MATCH,
        value: [],
      };
    case VocabularyUtils.XSD_STRING:
      return {
        property: att.iri,
        matchType: matchType || MatchType.SUBSTRING,
        value: [""],
      };
    default:
      return {
        property: att.iri,
        matchType: matchType || MatchType.IRI,
        value: [],
      };
  }
}
