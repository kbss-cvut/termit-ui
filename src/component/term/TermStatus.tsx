import Term from "../../model/Term";
import React from "react";
import { useI18n } from "../hook/useI18n";
import { Col, Label } from "reactstrap";
import DraftToggle from "./DraftToggle";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { setTermStatus } from "../../action/AsyncTermActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import Status from "../../model/TermStatus";

interface TermStatusProps {
  term: Term;
}

const TermStatus: React.FC<TermStatusProps> = ({ term }) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const onToggle = () => {
    dispatch(
      setTermStatus(
        VocabularyUtils.create(term.iri),
        Term.isDraft(term) ? Status.CONFIRMED : Status.DRAFT
      )
    );
  };

  return (
    <>
      <Col xl={2} md={4}>
        <Label className="attribute-label align-middle">
          {i18n("term.metadata.status")}
        </Label>
      </Col>
      <Col xl={10} md={8}>
        <DraftToggle
          id="term-metadata-status"
          draft={Term.isDraft(term)}
          onToggle={onToggle}
        />
      </Col>
    </>
  );
};

export default TermStatus;
