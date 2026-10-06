import { RdfIriStatement, RDFSTATEMENT_CONTEXT } from "../RdfStatement";
import VocabularyUtils from "../../util/VocabularyUtils";
import { ASSET_CONTEXT, HasIdentifier } from "../Asset";

const ctx = {
  relationship: {
    "@id": VocabularyUtils.RDF_SUBJECT,
    "@context": RDFSTATEMENT_CONTEXT,
  },
  attribute: VocabularyUtils.RDF_PREDICATE,
  value: VocabularyUtils.RDF_OBJECT,
} as const;

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT);

export default interface RelationshipAnnotation {
  relationship: RdfIriStatement;
  attribute: HasIdentifier;
  value: any[];
}
