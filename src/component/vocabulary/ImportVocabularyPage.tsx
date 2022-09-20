import IfUserIsEditor from "../authorization/IfUserIsEditor";
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
import IdentifierResolver from "../../util/IdentifierResolver";

interface ImportVocabularyPageProps {
  importVocabulary: (
    file: File,
    rename: Boolean
  ) => Promise<string | undefined>;
}

export const ImportVocabularyPage = (props: ImportVocabularyPageProps) => {
  const { i18n } = useI18n();
  const createFile = (file: File, rename: Boolean) =>
    props.importVocabulary(file, rename).then((location?: string) => {
      if (location) {
        Routing.transitionTo(
          Routes.vocabularySummary,
          IdentifierResolver.routingOptionsFromLocation(location)
        );
      }
    });
  const onCancel = () => Routing.transitionTo(Routes.vocabularies);

  return (
    <IfUserIsEditor>
      <HeaderWithActions title={i18n("vocabulary.import.dialog.title")} />
      <Card id="vocabulary-import" className="mb-3">
        <CardBody>
          <ImportVocabularyPanel
            propKeyPrefix="vocabulary.import"
            onSubmit={createFile}
            onCancel={onCancel}
            allowRename={true}
          />
        </CardBody>
      </Card>
    </IfUserIsEditor>
  );
};

export default connect(undefined, (dispatch: ThunkDispatch) => ({
  importVocabulary: (file: File, rename: Boolean) =>
    dispatch(importSkosAsNewVocabulary(file, rename)),
}))(withLoading(ImportVocabularyPage));
