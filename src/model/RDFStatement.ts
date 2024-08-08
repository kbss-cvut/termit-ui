import VocabularyUtils from "../util/VocabularyUtils";
import { HasIdentifier } from "./Asset";

export const RDFSTATEMENT_CONTEXT = {
  iri: "@id",
  types: "@type",
  object: VocabularyUtils.RDF_OBJECT,
  relation: VocabularyUtils.RDF_PREDICATE,
  subject: VocabularyUtils.RDF_SUBJECT,
};

export type RDFStatement = {
  object: HasIdentifier;
  relation: HasIdentifier;
  subject: HasIdentifier;
};

export default RDFStatement;
