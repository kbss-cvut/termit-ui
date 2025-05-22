import { Element } from "domhandler";
import VocabularyUtils, { IRI, IRIImpl } from "../../util/VocabularyUtils";
import JsonLdUtils from "../../util/JsonLdUtils";
import Term from "../../model/Term";
import TermOccurrence from "../../model/TermOccurrence";

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

export function createTermOccurrence(
  term: Term,
  annotationElement: Element,
  fileIri: IRI
) {
  const to = new TermOccurrence({
    iri: annotationIdToTermOccurrenceIri(
      annotationElement.attribs.about,
      fileIri
    ),
    term,
    target: {
      source: {
        iri: fileIri.namespace + fileIri.fragment,
      },
      selectors: [],
      types: [VocabularyUtils.FILE_OCCURRENCE_TARGET],
    },
    types: [],
  });
  to.elementAbout = annotationElement.attribs.about.substring(
    JsonLdUtils.BNODE_PREFIX.length
  );
  return to;
}
