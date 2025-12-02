import VocabularyUtils from "../../util/VocabularyUtils";
import { CONTEXT as TERM_CONTEXT, TermInfo } from "../Term";
import { HasIdentifier } from "../Asset";

const ctx = {
  subject: VocabularyUtils.RDF_SUBJECT,
  property: VocabularyUtils.RDF_PREDICATE,
  object: VocabularyUtils.RDF_OBJECT,
  annotationProperty: VocabularyUtils.DC_RELATION,
} as const;

export const CONTEXT = Object.assign({}, ctx, TERM_CONTEXT);

export default interface AnnotatedTermRelationship {
  subject: TermInfo;
  property: HasIdentifier;
  object: TermInfo;
  annotationProperty: HasIdentifier;
}
