import VocabularyUtils from "../util/VocabularyUtils";
import { HasIdentifier } from "./Asset";

export const RDFSTATEMENT_CONTEXT = {
  iri: "@id",
  types: "@type",
  subject: VocabularyUtils.RDF_SUBJECT,
  relation: VocabularyUtils.RDF_PREDICATE,
  value: VocabularyUtils.RDF_OBJECT,
};

export type RDFStatement = {
  subject: HasIdentifier;
  relation: HasIdentifier;
  value: HasIdentifier;
};

export default RDFStatement;
