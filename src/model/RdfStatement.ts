import VocabularyUtils, { IRIImpl } from "../util/VocabularyUtils";
import { HasIdentifier } from "./Asset";

export const RDFSTATEMENT_CONTEXT = {
  iri: "@id",
  types: "@type",
  subject: VocabularyUtils.RDF_SUBJECT,
  relation: VocabularyUtils.RDF_PREDICATE,
  value: VocabularyUtils.RDF_OBJECT,
};

/**
 * RDF Statement of 3 IRIs
 */
export type RdfIriStatement = {
  subject: HasIdentifier;
  relation: HasIdentifier;
  value: HasIdentifier;
};

/**
 * Type of {@link RdfValue}
 */
export enum RdfValueType {
  IRI = "IRI",
  BNode = "BNode",
  Literal = "Literal",
  Triple = "Triple",
}

/**
 * RDF Value representing one of {@link RdfValueType}s
 */
export interface RdfValue {
  type: RdfValueType;
  stringValue: string;
}

/**
 * Literal value
 */
export interface RdfLiteral extends RdfValue {
  type: RdfValueType.Literal;

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
  coreDatatype: string;
}

/**
 * Common interface for {@link RdfIRI} and {@link RdfTriple}
 */
export interface RdfResource extends RdfValue {}

export interface RdfIRI extends RdfResource {
  type: RdfValueType.IRI;

  localName: string;
  namespace: string;
}

export interface RdfTriple extends RdfResource {
  type: RdfValueType.Triple;

  subject: RdfResource;
  predicate: RdfIRI;
  object: RdfValue;
}

export interface RdfStatement {
  subject: RdfResource;
  predicate: RdfIRI;
  object: RdfValue;
  context: RdfResource;
}

export function toIRIImpl(rdf4jIri: RdfIRI) {
  return IRIImpl.create({
    namespace: rdf4jIri.namespace,
    fragment: rdf4jIri.localName,
  });
}

export default RdfIriStatement;
