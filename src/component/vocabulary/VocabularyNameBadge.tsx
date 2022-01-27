import * as React from "react";
import { AssetData } from "../../model/Asset";
import { Badge } from "reactstrap";
import classNames from "classnames";
import "./VocabularyNameBadge.scss";
import { getShortVocabularyLabel } from "../../util/VocabularyUtils";

interface VocabularyNameBadgeProps {
  vocabulary?: AssetData;
  className?: string;
}

const VocabularyNameBadge: React.FC<VocabularyNameBadgeProps> = (props) => {
  const { vocabulary, className } = props;
  if (!vocabulary) {
    return null;
  }
  return (
    <Badge
      color="info"
      pill={true}
      className={classNames("vocabulary-name-badge", className)}
    >
      {getShortVocabularyLabel(vocabulary.iri!)}
    </Badge>
  );
};

export default VocabularyNameBadge;
