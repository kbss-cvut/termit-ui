import { IRIImpl } from "../util/VocabularyUtils";

export enum Rdf4jType {
  IRI = "IRI",
  BNode = "BNode",
  Literal = "Literal",
  Triple = "Triple",
}

export interface Rdf4jValue {
  BNode: false;
  IRI: boolean;
  resource: boolean;
  literal: boolean;
  triple: boolean;
  type: Rdf4jType;
}

export interface Rdf4jLiteral extends Rdf4jValue {
  IRI: false;
  literal: true;
  resource: false;

  type: Rdf4jType.Literal;
  label: string;
  language?: string;
  coreDatatype: string;
}

export interface Rdf4jResource extends Rdf4jValue {
  resource: true;
  literal: false;
}

export interface Rdf4jIRI extends Rdf4jResource {
  IRI: true;

  localName: string;
  namespace: string;
  type: Rdf4jType.IRI;
}

export interface Rdf4jTriple extends Rdf4jResource {
  triple: true;
  type: Rdf4jType.Triple;
  subject: Rdf4jResource;
  predicate: Rdf4jIRI;
  object: Rdf4jValue;
}

export interface Rdf4jStatement {
  subject: Rdf4jResource;
  predicate: Rdf4jIRI;
  object: Rdf4jValue;
  context: Rdf4jResource;
}

export function toIRIImpl(rdf4jIri: Rdf4jIRI) {
  return IRIImpl.create({
    namespace: rdf4jIri.namespace,
    fragment: rdf4jIri.localName,
  });
}
