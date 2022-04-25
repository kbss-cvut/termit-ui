import IfUserAuthorized from "../authorization/IfUserAuthorized";
import ImportVocabularyPanel from "./ImportVocabularyPanel";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import withLoading from "../hoc/withLoading";
import { importSkosAsNewVocabulary } from "../../action/AsyncImportActions";
import { useI18n } from "../hook/useI18n";
import HeaderWithActions from "../misc/HeaderWithActions";
import { Card, CardBody } from "reactstrap";

interface ImportVocabularyPageProps {
  importVocabulary: (file: File, rename: Boolean) => any;
}

export const ImportVocabularyPage = (props: ImportVocabularyPageProps) => {
  const { i18n } = useI18n();
  const createFile = (file: File, rename: Boolean) =>
    props.importVocabulary(file, rename).then(onCancel);
  const onCancel = () => Routing.transitionTo(Routes.vocabularies);

  return (
    <IfUserAuthorized renderUnauthorizedAlert={false}>
      <HeaderWithActions title={i18n("vocabulary.import.dialog.title")} />
      <Card id="vocabulary-import" className="mb-3">
        <CardBody>
          <ImportVocabularyPanel
            propKeyPrefix="vocabulary.import"
            onSubmit={createFile}
            onCancel={onCancel}
          />
        </CardBody>
      </Card>
    </IfUserAuthorized>
  );
};

export default connect(undefined, (dispatch: ThunkDispatch) => ({
  importVocabulary: (file: File, rename: Boolean) =>
    dispatch(importSkosAsNewVocabulary(file, rename)),
}))(withLoading(ImportVocabularyPage));
