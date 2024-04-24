import { IRI, IRIImpl } from "../../util/VocabularyUtils";
import JsonLdUtils from "../../util/JsonLdUtils";

const OCCURRENCE_SEPARATOR = "/occurrences";

export function annotationIdToTermOccurrenceIri(
  annotationId: string,
  fileIri: IRI
) {
  if (annotationId.startsWith(JsonLdUtils.BNODE_PREFIX)) {
    annotationId = annotationId.substring(JsonLdUtils.BNODE_PREFIX.length);
  }
  return `${IRIImpl.toString(fileIri)}${OCCURRENCE_SEPARATOR}/${annotationId}`;
}
