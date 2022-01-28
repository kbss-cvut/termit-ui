import * as React from "react";
import { useEffect, useState } from "react";
import VocabularyUtils from "../../util/VocabularyUtils";
import Term from "../../model/Term";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadTermByIri } from "../../action/AsyncActions";
import TermLink from "./TermLink";
import OutgoingLink from "../misc/OutgoingLink";

interface TermIriLinkProps {
  iri: string;
  id?: string;
  activeTab?: string;
}

const TermIriLink: React.FC<TermIriLinkProps> = (props) => {
  const { iri, id, activeTab } = props;
  const [term, setTerm] = useState<Term | null>(null);
  const dispatch: ThunkDispatch = useDispatch();
  useEffect(() => {
    const tIri = VocabularyUtils.create(iri);
    dispatch(loadTermByIri(tIri)).then((term) => setTerm(term));
  }, [iri, dispatch, setTerm]);

  return (
    <>
      {term !== null ? (
        <TermLink id={id} term={term} activeTab={activeTab} />
      ) : (
        <OutgoingLink label={iri} iri={iri} />
      )}
    </>
  );
};

export default TermIriLink;
