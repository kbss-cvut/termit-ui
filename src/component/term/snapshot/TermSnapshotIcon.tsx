import React from "react";
import Term, { TermInfo } from "../../../model/Term";
import { Routing, Terms } from "../../../util/Routing";
import { Link } from "react-router-dom";
import SnapshotIcon from "../../snapshot/SnapshotIcon";
import Vocabulary from "../../../model/Vocabulary";

const TermSnapshotIcon: React.FC<{ term: Term; vocabulary: Vocabulary }> = ({
  term,
  vocabulary,
}) => {
  if (!term.snapshotOf() || !vocabulary.snapshotOf()) {
    return null;
  }
  const routingTerm: TermInfo = {
    iri: term.snapshotOf()!,
    label: term.label,
    vocabulary: {
      iri: vocabulary?.snapshotOf(),
    },
    types: [],
  };
  const { route, params, query } = Terms.getTermRoutingOptions(routingTerm);
  return (
    <>
      <Link to={Routing.getTransitionPath(route, { params, query })}>
        <SnapshotIcon assetType="type.term" id="term-snapshot-icon" />
      </Link>
    </>
  );
};

export default TermSnapshotIcon;
