import IfUserAuthorized from "../authorization/IfUserAuthorized";
import ImportVocabularyPanel from "./ImportVocabularyPanel";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import withLoading from "../hoc/withLoading";
import { importSkosAsNewVocabulary } from "../../action/AsyncImportActions";

interface ImportVocabularyPageProps {
  importVocabulary: (file: File, rename: Boolean) => any;
}

export const ImportVocabularyPage = (props: ImportVocabularyPageProps) => {
  const createFile = (file: File, rename: Boolean) =>
    props.importVocabulary(file, rename).then(onCancel);
  const onCancel = () => Routing.transitionTo(Routes.vocabularies);

  return (
    <IfUserAuthorized renderUnauthorizedAlert={false}>
      <ImportVocabularyPanel onSubmit={createFile} onCancel={onCancel} />
    </IfUserAuthorized>
  );
};

export default connect(undefined, (dispatch: ThunkDispatch) => ({
  importVocabulary: (file: File, rename: Boolean) =>
    dispatch(importSkosAsNewVocabulary(file, rename)),
}))(withLoading(ImportVocabularyPage));
