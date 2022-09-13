import * as React from "react";
import { Button, Card, CardBody, Col } from "reactstrap";
import Routes from "../../util/Routes";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  executeTextAnalysisOnAllVocabularies,
  loadVocabularies as loadVocabulariesAction,
} from "../../action/AsyncActions";
import VocabularyList from "./VocabularyList";
import { Link } from "react-router-dom";
import { GoClippy, GoPlus } from "react-icons/go";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import IfUserIsEditor from "../authorization/IfUserIsEditor";
import { useI18n } from "../hook/useI18n";

interface VocabularyManagementProps {
  loadVocabularies: () => void;
  analyzeAllVocabularies: () => void;
}

export const VocabularyManagement: React.FC<VocabularyManagementProps> = (
  props
) => {
  const { loadVocabularies, analyzeAllVocabularies } = props;
  const { i18n } = useI18n();
  React.useEffect(() => {
    loadVocabularies();
  }, [loadVocabularies]);

  const buttons = [
    <IfUserIsEditor key="vocabularies-create">
      <Link
        id="vocabularies-create"
        className="btn btn-primary btn-sm"
        title={i18n("vocabulary.vocabularies.create.tooltip")}
        to={Routes.createVocabulary.path}
      >
        <GoPlus />
        &nbsp;{i18n("vocabulary.management.new")}
      </Link>
    </IfUserIsEditor>,
    <IfUserIsEditor key="analyze-vocabularies">
      <Button
        id="analyze-vocabularies"
        className="btn"
        size="sm"
        color="primary"
        title={i18n("vocabulary.management.startTextAnalysis.title")}
        onClick={analyzeAllVocabularies}
      >
        <GoClippy />
        &nbsp;{i18n("file.metadata.startTextAnalysis.text")}
      </Button>
    </IfUserIsEditor>,
  ];

  return (
    <>
      <WindowTitle title={i18n("vocabulary.management.vocabularies")} />
      <HeaderWithActions
        title={i18n("vocabulary.management")}
        actions={buttons}
      />
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
