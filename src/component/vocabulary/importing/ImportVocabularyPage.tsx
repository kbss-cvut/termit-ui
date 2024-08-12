import IfUserIsEditor from "../../authorization/IfUserIsEditor";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { importSkosAsNewVocabulary } from "../../../action/AsyncImportActions";
import { useI18n } from "../../hook/useI18n";
import HeaderWithActions from "../../misc/HeaderWithActions";
import { Card, CardBody, Label } from "reactstrap";
import IdentifierResolver from "../../../util/IdentifierResolver";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import ImportVocabularyDialog from "./ImportVocabularyDialog";

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
          <Label className="attribute-label mb-2">
            {i18n("vocabulary.import.dialog.message")}
          </Label>
          <ImportVocabularyDialog
            propKeyPrefix="vocabulary.import"
            onCreate={createFile}
            onCancel={onCancel}
            allowRename={true}
          />
        </CardBody>
      </Card>
    </IfUserIsEditor>
  );
};

export default ImportVocabularyPage;
