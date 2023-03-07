import React, { useState } from "react";
import { AssetData } from "../../model/Asset";
import VocabularyNameBadge from "./VocabularyNameBadge";
import { UncontrolledTooltip } from "reactstrap";
import { Routing } from "../../util/Routing";
import { isLoggedIn } from "../../util/Authorization";
import Routes from "../../util/Routes";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import VocabularyUtils from "../../util/VocabularyUtils";
import { Link } from "react-router-dom";
import { ThunkDispatch } from "../../util/Types";
import { getLabel } from "../../action/AsyncActions";
import Utils from "../../util/Utils";

interface VocabularyNameBadgeButtonProps {
  vocabulary?: AssetData;
  className?: string;
  termIri: string;
  section: string;
}

const VocabularyNameBadgeButton: React.FC<VocabularyNameBadgeButtonProps> = ({
  className,
  vocabulary,
  termIri,
  section,
}) => {
  const dispatch: ThunkDispatch = useDispatch();
  const user = useSelector((state: TermItState) => state.user);
  const [label, setLabel] = useState<string>();
  // Unique identifier to associate tooltip with correct term on the page (same term can appear multiple times in diff sections
  const id = `vocabulary-name-badge-${section}` + Utils.hashCode(termIri);

  // We need to know the label in advance. If the tooltip's content changes, the arrow gets misplaced
  React.useEffect(() => {
    if (!vocabulary) return;
    dispatch(getLabel(vocabulary!.iri!)).then((data) => {
      if (data) {
        setLabel(data);
      } else {
        setLabel(vocabulary!.iri!);
      }
    });
  }, [dispatch, vocabulary]);

  if (!vocabulary) {
    return null;
  }

  const iri = VocabularyUtils.create(vocabulary!.iri!);
  const path = Routing.getTransitionPath(
    isLoggedIn(user)
      ? Routes.vocabularySummary
      : Routes.publicVocabularySummary,
    {
      params: new Map([["name", iri.fragment]]),
      query: new Map([["namespace", iri.namespace!]]),
    }
  );

  return (
    <>
      <div id={id} className="d-inline-block">
        <Link to={path}>
          <VocabularyNameBadge vocabulary={vocabulary} className={className} />
        </Link>
      </div>
      {label && (
        <UncontrolledTooltip target={id} placement="right">
          {label}
        </UncontrolledTooltip>
      )}
    </>
  );
};

export default VocabularyNameBadgeButton;
