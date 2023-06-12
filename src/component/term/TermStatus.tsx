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
import DraftBadge from "./DraftBadge";
import Vocabulary from "../../model/Vocabulary";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";

interface TermStatusProps {
  term: Term;
  vocabulary: Vocabulary;
}

const TermStatus: React.FC<TermStatusProps> = ({ term, vocabulary }) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const isDraft = Term.isDraft(term);
  const onToggle = () => {
    dispatch(
      setTermStatus(
        VocabularyUtils.create(term.iri),
        isDraft ? Status.CONFIRMED : Status.DRAFT
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
        <IfVocabularyActionAuthorized
          vocabulary={vocabulary}
          requiredAccessLevel={AccessLevel.WRITE}
          unauthorized={<DraftBadge isDraft={isDraft} />}
        >
          <DraftToggle
            id="term-metadata-status"
            draft={isDraft}
            onToggle={onToggle}
          />
        </IfVocabularyActionAuthorized>
      </Col>
    </>
  );
};

export default TermStatus;
