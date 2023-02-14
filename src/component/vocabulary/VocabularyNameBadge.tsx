import * as React from "react";
import { AssetData } from "../../model/Asset";
import { Badge, UncontrolledTooltip } from "reactstrap";
import classNames from "classnames";
import "./VocabularyNameBadge.scss";
import { getShortVocabularyLabel } from "../../util/VocabularyUtils";
import Utils from "../../util/Utils";

interface VocabularyNameBadgeProps {
  vocabulary?: AssetData;
  className?: string;
}

const VocabularyNameBadge: React.FC<VocabularyNameBadgeProps> = (props) => {
  const { vocabulary, className } = props;
  if (!vocabulary) {
    return null;
  }
  const id = Utils.createDomId(vocabulary.iri!);
  return (
    <>
      <Badge
        color="info"
        pill={true}
        id={"tooltip-" + id}
        className={classNames(
          "vocabulary-name-badge",
          "align-text-bottom",
          className
        )}
      >
        {getShortVocabularyLabel(vocabulary.iri!)}
      </Badge>
      <UncontrolledTooltip
        id="tooltip-vocabulary-badge"
        placement="right"
        offset="1rem"
        target={"tooltip-" + id}
        fade={true}
        delay={{ show: 0, hide: 300 }}
      >
        {vocabulary.iri}
      </UncontrolledTooltip>
    </>
  );
};

export default VocabularyNameBadge;
