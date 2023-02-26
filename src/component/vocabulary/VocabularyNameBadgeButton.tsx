import React, { useRef, useState } from "react";
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

interface VocabularyNameBadgeButtonProps {
  vocabulary?: AssetData;
  className?: string;
}

const VocabularyNameBadgeButton: React.FC<VocabularyNameBadgeButtonProps> = ({
  className,
  vocabulary,
}) => {
  const linkRef = useRef(null);
  const dispatch: ThunkDispatch = useDispatch();
  const user = useSelector((state: TermItState) => state.user);
  const [label, setLabel] = useState<string>();
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
      <div ref={linkRef} className="d-inline-block">
        <Link to={path}>
          <VocabularyNameBadge vocabulary={vocabulary} className={className} />
        </Link>
      </div>
      {label && (
        <UncontrolledTooltip
          // @ts-ignore
          target={linkRef.current}
          placement="right"
        >
          {label}
        </UncontrolledTooltip>
      )}
    </>
  );
};

export default VocabularyNameBadgeButton;
