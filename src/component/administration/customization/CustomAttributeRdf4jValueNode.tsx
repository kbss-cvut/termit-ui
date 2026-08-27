import {
  Rdf4jIRI,
  Rdf4jLiteral,
  Rdf4jTriple,
  Rdf4jValue,
  toIRIImpl,
} from "../../../model/Rdf4jStatement";
import * as React from "react";
import { useMemo } from "react";
import VocabularyIriLink from "../../vocabulary/VocabularyIriLink";
import TermIriLink from "../../term/TermIriLink";
import Utils from "../../../util/Utils";
import OutgoingLink from "../../misc/OutgoingLink";
import VocabularyUtils from "../../../util/VocabularyUtils";
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
const Rdf4jIRINode: React.FC<{ iri: Rdf4jIRI; type: IriType }> = ({
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
const Rdf4jLiteralNode: React.FC<{ literal: Rdf4jLiteral }> = ({ literal }) => {
  let labelText;

  switch (literal.coreDatatype) {
    case VocabularyUtils.XSD_STRING:
      labelText = literal.label;
      if (literal.language) {
        labelText += "@" + literal.language;
      }
      break;
    default:
      labelText = literal.label;
  }

  return (
    <>
      "<code>{labelText}</code>"
    </>
  );
};

/**
 * Renders term relation triple
 */
const Rdf4jTripleNode: React.FC<{ triple: Rdf4jTriple }> = ({ triple }) => {
  return (
    <>
      <CustomAttributeRdf4jValueNode
        value={triple.subject}
        type={IriType.TERM}
      />
      <br />
      <CustomAttributeRdf4jValueNode value={triple.predicate} />
      <br />
      <CustomAttributeRdf4jValueNode
        value={triple.object}
        type={IriType.TERM}
      />
    </>
  );
};

export interface Rdf4jValueNodeProps {
  value: Rdf4jValue;
  type?: IriType;
}

/**
 * Renders the given {@link Rdf4jValue}.
 * If the value is {@link Rdf4jIRI} and type is provided,
 * a link to the respective entity is rendered.
 */
const CustomAttributeRdf4jValueNode: React.FC<Rdf4jValueNodeProps> = ({
  value,
  type = IriType.UNKNOWN,
}) => {
  if (value.triple) {
    return <Rdf4jTripleNode triple={value as Rdf4jTriple} />;
  }
  if (value.IRI && type != null) {
    return <Rdf4jIRINode iri={value as Rdf4jIRI} type={type} />;
  }
  if (value.literal) {
    return <Rdf4jLiteralNode literal={value as Rdf4jLiteral} />;
  }

  return null;
};

export default CustomAttributeRdf4jValueNode;
