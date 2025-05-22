import React from "react";
import { Card, CardBody, Label } from "reactstrap";
import { useI18n } from "src/component/hook/useI18n";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import ImportVocabularyDialog from "./ImportVocabularyDialog";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { importSkosAsNewVocabulary } from "../../../action/AsyncImportActions";
import IdentifierResolver from "../../../util/IdentifierResolver";

const CreateVocabularyFromSkos: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const importSkos = (file: File, rename: Boolean) =>
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

  return (
    <Card id="vocabulary-import" className="mb-3">
      <CardBody>
        <PromiseTrackingMask area="import-vocabulary" />
        <Label className="attribute-label mb-2">
          {i18n("vocabulary.import.dialog.message")}
        </Label>
        <ImportVocabularyDialog
          propKeyPrefix="vocabulary.import"
          onCreate={importSkos}
          onCancel={() => Routing.transitionTo(Routes.vocabularies)}
          allowRename={true}
        />
      </CardBody>
    </Card>
  );
};

export default CreateVocabularyFromSkos;
