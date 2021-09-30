import * as React from "react";
import { Card, CardBody, Col } from "reactstrap";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  executeTextAnalysisOnAllVocabularies,
  loadVocabularies as loadVocabulariesAction,
} from "../../action/AsyncActions";
import VocabularyList from "./VocabularyList";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import { useI18n } from "../hook/useI18n";

interface VocabularyManagementProps {
  loadVocabularies: () => void;
  analyzeAllVocabularies: () => void;
}

export const VocabularyManagement: React.FC<VocabularyManagementProps> = (
  props
) => {
  const { loadVocabularies } = props;
  const { i18n } = useI18n();
  React.useEffect(() => {
    loadVocabularies();
  }, [loadVocabularies]);

  return (
    <>
      <WindowTitle title={i18n("vocabulary.management.vocabularies")} />
      <HeaderWithActions title={i18n("vocabulary.management")} />
      <div className="row">
        <Col md={12}>
          <Card>
            <CardBody>
              <VocabularyList />
            </CardBody>
          </Card>
        </Col>
      </div>
    </>
  );
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    loadVocabularies: () => dispatch(loadVocabulariesAction()),
    analyzeAllVocabularies: () =>
      dispatch(executeTextAnalysisOnAllVocabularies()),
  };
})(VocabularyManagement);
