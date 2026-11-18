import {
  RdfIRI,
  RdfLiteral,
  RdfTriple,
  RdfValue,
  toIRIImpl,
} from "../../model/RdfStatement";
import * as React from "react";
import { useMemo } from "react";
import VocabularyIriLink from "../vocabulary/VocabularyIriLink";
import TermIriLink from "../term/TermIriLink";
import Utils from "../../util/Utils";
import OutgoingLink from "../misc/OutgoingLink";
import VocabularyUtils from "../../util/VocabularyUtils";
import { UncontrolledTooltip } from "reactstrap";

/**
 * A possible known entity type an IRI represents
 */
export enum IriType {
  UNKNOWN = "UNKNOWN",
  TERM = "TERM",
  VOCABULARY = "VOCABULARY",
}

/**
 * Resolves {@link IriType} from the type iri
 *
 * @param typeIri the iri of the type
 */
export function getIriType(typeIri?: string) {
  switch (typeIri) {
    case VocabularyUtils.TERM:
      return IriType.TERM;
    case VocabularyUtils.VOCABULARY:
      return IriType.VOCABULARY;
    default:
      return IriType.UNKNOWN;
  }
}

/**
 * Based on the provided type renders either link to the respective Term or Vocabulary
 * or renders generic outgoing link as shortened IRI.
 */
const RdfIRINode: React.FC<{ iri: RdfIRI; type: IriType }> = ({
  iri,
  type,
}) => {
  const iriString = useMemo(() => toIRIImpl(iri).toString(), [iri]);
  switch (type) {
    case IriType.TERM:
      return <TermIriLink iri={iriString} />;
    case IriType.VOCABULARY:
      return <VocabularyIriLink iri={iriString} />;
    default:
      const linkId = "outgoing-link-" + Utils.hashCode(iriString);
      return (
        <>
          <span id={linkId}>
            <OutgoingLink
              label={Utils.shrinkFullIri(iriString)}
              iri={iriString}
            />
            <UncontrolledTooltip
              placement="auto-start"
              offset="1rem"
              target={linkId}
              fade={true}
              delay={{ show: 0, hide: 500 }}
            >
              {iriString}
            </UncontrolledTooltip>
          </span>
        </>
      );
  }
};

/**
 * Renders literal value as a simple inline code block
 */
const RdfLiteralNode: React.FC<{ literal: RdfLiteral }> = ({ literal }) => {
  let language;

  if (
    literal.datatype.iri === VocabularyUtils.RDF_LANGSTRING &&
    literal.language != null
  ) {
    language = "@" + literal.language;
  }

  return (
    <>
      &quot;<code>{literal.label}</code>&quot;
      {language}
    </>
  );
};

/**
 * Renders term relation triple
 */
const RdfTripleNode: React.FC<{ triple: RdfTriple }> = ({ triple }) => {
  return (
    <>
      <RdfValueNode value={triple.subject} type={IriType.TERM} />
      <br />
      <RdfValueNode value={triple.predicate} />
      <br />
      <RdfValueNode value={triple.object} type={IriType.TERM} />
    </>
  );
};

export interface RdfValueNodeProps {
  value: RdfValue;
  type?: IriType;
}

/**
 * Renders the given {@link RdfValue}.
 * If the value is {@link RdfIRI} and type is provided,
 * a link to the respective entity is rendered.
 */
const RdfValueNode: React.FC<RdfValueNodeProps> = ({
  value,
  type = IriType.UNKNOWN,
}) => {
  const types = Utils.sanitizeArray(value.types);
  if (types.includes(VocabularyUtils.RDF_STATEMENT)) {
    return <RdfTripleNode triple={value as RdfTriple} />;
  }
  if (types.includes(VocabularyUtils.RDF_COMPOUND_LITERAL)) {
    return <RdfLiteralNode literal={value as RdfLiteral} />;
  }
  if (types.includes(VocabularyUtils.RDFS_RESOURCE) && type != null) {
    return <RdfIRINode iri={value as RdfIRI} type={type} />;
  }
  return null;
};

export default RdfValueNode;
