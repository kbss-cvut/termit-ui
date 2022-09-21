import React from "react";
import Vocabulary from "../../../model/Vocabulary";
import { Routing, Vocabularies } from "../../../util/Routing";
import { Link } from "react-router-dom";
import SnapshotIcon from "../../snapshot/SnapshotIcon";

const VocabularySnapshotIcon: React.FC<{ vocabulary?: Vocabulary }> = ({
  vocabulary,
}) => {
  if (!vocabulary || !vocabulary.isSnapshot()) {
    return null;
  }
  const routingVocabulary: Vocabulary = new Vocabulary({
    iri: vocabulary.snapshotOf(),
    label: vocabulary.label,
    types: [],
  });
  const { route, params, query } =
    Vocabularies.getVocabularyRoutingOptions(routingVocabulary);
  return (
    <>
      <Link to={Routing.getTransitionPath(route, { params, query })}>
        <SnapshotIcon
          assetType="type.vocabulary"
          id="vocabulary-snapshot-icon"
        />
      </Link>
    </>
  );
};

export default VocabularySnapshotIcon;
