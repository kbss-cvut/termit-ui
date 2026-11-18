import VocabularyUtils from "../util/VocabularyUtils";
import { HasIdentifier, HasTypes } from "./Asset";

export const RDF_IRI_STATEMENT_CONTEXT = {
  iri: "@id",
  types: "@type",
  subject: VocabularyUtils.RDF_SUBJECT,
  relation: VocabularyUtils.RDF_PREDICATE,
  value: VocabularyUtils.RDF_OBJECT,
};

const RDF_LITERAL_CONTEXT = {
  label: VocabularyUtils.RDF_VALUE,
  language: VocabularyUtils.RDF_LANGUAGE,
  datatype: VocabularyUtils.DC_TYPE,
};

export const RDF_STATEMENT_CONTEXT = {
  iri: "@id",
  types: "@type",
  subject: VocabularyUtils.RDF_SUBJECT,
  predicate: VocabularyUtils.RDF_PREDICATE,
  object: VocabularyUtils.RDF_OBJECT,
  context: VocabularyUtils.DC_SOURCE,
  ...RDF_LITERAL_CONTEXT,
};

/**
 * RDF Statement of 3 IRIs
 */
export type RdfIriStatement = {
  subject: HasIdentifier;
  relation: HasIdentifier;
  value: HasIdentifier;
};

export interface RdfValue extends HasTypes {}

/**
 * Literal value
 */
export interface RdfLiteral extends RdfValue {
  /**
   * String representation of the literal value
   */
  label: string;

  /**
   * Language of the LangString, or null
   */
  language?: string;

  /**
   * Datatype IRI
   */
  datatype: HasIdentifier;
}

/**
 * Common interface for {@link RdfIRI} and {@link RdfTriple}
 */
export interface RdfResource extends RdfValue {}

export interface RdfIRI extends RdfResource, HasIdentifier {}

export interface RdfTriple extends RdfResource {
  subject: RdfResource;
  predicate: RdfIRI;
  object: RdfValue;
}

export interface RdfStatement {
  subject: RdfResource;
  predicate: RdfIRI;
  object: RdfValue;
  context: RdfIRI;
}

export function toIRIImpl(rdfIri: RdfIRI) {
  return VocabularyUtils.create(rdfIri.iri);
}

export default RdfIriStatement;
