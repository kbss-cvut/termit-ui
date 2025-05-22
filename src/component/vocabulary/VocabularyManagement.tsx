import * as React from "react";
import { Button, Card, CardBody } from "reactstrap";
import Routes from "../../util/Routes";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  executeTextAnalysisOnAllVocabularies,
  loadVocabularies,
} from "../../action/AsyncActions";
import VocabularyList from "./VocabularyList";
import { Link } from "react-router-dom";
import { GoClippy, GoPlus } from "react-icons/go";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import IfUserIsEditor from "../authorization/IfUserIsEditor";
import { useI18n } from "../hook/useI18n";
import IfUserIsAdmin from "../authorization/IfUserIsAdmin";
import { FaFileImport } from "react-icons/fa";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";

export const VocabularyManagement: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    trackPromise(dispatch(loadVocabularies()), "vocabularies");
  }, [dispatch]);
  const onAnalyzeAllVocabularies = () =>
    dispatch(executeTextAnalysisOnAllVocabularies());

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
      <Link
        id="vocabularies-import"
        className="btn btn-primary btn-sm"
        title={i18n("vocabulary.vocabularies.import.tooltip")}
        to={Routes.importVocabulary.path}
      >
        <FaFileImport />
        &nbsp;{i18n("main.nav.import-vocabulary")}
      </Link>
    </IfUserIsEditor>,
    <IfUserIsAdmin key="analyze-vocabularies">
      <Button
        id="analyze-vocabularies"
        className="btn"
        size="sm"
        color="primary"
        title={i18n("vocabulary.management.startTextAnalysis.title")}
        onClick={onAnalyzeAllVocabularies}
      >
        <GoClippy />
        &nbsp;{i18n("file.metadata.startTextAnalysis.text")}
      </Button>
    </IfUserIsAdmin>,
  ];

  return (
    <>
      <WindowTitle title={i18n("vocabulary.management.vocabularies")} />
      <HeaderWithActions
        title={i18n("vocabulary.management")}
        actions={buttons}
      />
      <PromiseTrackingMask area="vocabularies" />
      <Card>
        <CardBody>
          <VocabularyList />
        </CardBody>
      </Card>
    </>
  );
};

export default VocabularyManagement;
