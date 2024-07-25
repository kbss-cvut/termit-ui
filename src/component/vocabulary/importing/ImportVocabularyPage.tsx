import IfUserIsEditor from "../../authorization/IfUserIsEditor";
import ImportVocabularyPanel from "./ImportVocabularyPanel";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { importSkosAsNewVocabulary } from "../../../action/AsyncImportActions";
import { useI18n } from "../../hook/useI18n";
import HeaderWithActions from "../../misc/HeaderWithActions";
import { Card, CardBody } from "reactstrap";
import IdentifierResolver from "../../../util/IdentifierResolver";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";

const ImportVocabularyPage = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const createFile = (file: File, rename: Boolean) =>
    trackPromise(
      dispatch(importSkosAsNewVocabulary(file, rename)),
      "import-vocabulary"
    ).then((location?: string) => {
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
          <PromiseTrackingMask area="import-vocabulary" />
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

export default ImportVocabularyPage;
