import { RDFStatement, RDFSTATEMENT_CONTEXT } from "../RDFStatement";
import VocabularyUtils from "../../util/VocabularyUtils";
import { HasIdentifier } from "../Asset";

const ctx = {
  relationship: VocabularyUtils.RDF_SUBJECT,
  attribute: VocabularyUtils.RDF_PREDICATE,
  value: VocabularyUtils.RDF_OBJECT,
} as const;

export const CONTEXT = Object.assign({}, ctx, RDFSTATEMENT_CONTEXT);

export default interface RelationshipAnnotation {
  relationship: RDFStatement;
  attribute: HasIdentifier;
  value: any[];
}
