import * as React from "react";
import { useEffect, useState } from "react";
import VocabularyUtils from "../../util/VocabularyUtils";
import { TermInfo } from "../../model/Term";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { getLabel, loadTermInfoByIri } from "../../action/AsyncActions";
import TermLink from "./TermLink";
import OutgoingLink from "../misc/OutgoingLink";
import Utils from "../../util/Utils";

interface TermIriLinkProps {
  iri: string;
  id?: string;
  activeTab?: string;
  shrinkFullIri?: boolean;
  showVocabularyBadge?: boolean;
}

const TermIriLink: React.FC<TermIriLinkProps> = (props) => {
  const { iri, id, activeTab, showVocabularyBadge } = props;
  const [term, setTerm] = useState<TermInfo | null>(null);
  const dispatch: ThunkDispatch = useDispatch();
  const [label, setLabel] = useState<string>();
  useEffect(() => {
    const tIri = VocabularyUtils.create(iri);
    dispatch(loadTermInfoByIri(tIri)).then((term) => {
      if (term != null) {
        setTerm(term);
      } else {
        dispatch(getLabel(iri)).then((label) => setLabel(label));
      }
    });
  }, [iri, dispatch, setTerm]);

  return (
    <>
      {term !== null ? (
        <TermLink
          id={id}
          term={term}
          activeTab={activeTab}
          showVocabularyBadge={showVocabularyBadge}
        />
      ) : (
        <OutgoingLink
          label={
            label ?? (props.shrinkFullIri ? Utils.shrinkFullIri(iri) : iri)
          }
          iri={iri}
        />
      )}
    </>
  );
};

export default TermIriLink;
