import React from "react";
import { Card, CardBody, Label } from "reactstrap";
import { useI18n } from "src/component/hook/useI18n";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import {
  getAvailableVocabularies,
  importSkosAsNewVocabulary,
} from "../../../action/AsyncImportActions";
import ImportExternalVocabularyDialog from "./ImportExternalVocabularyDialog";
import RdfsResource from "../../../model/RdfsResource";
import IdentifierResolver from "../../../util/IdentifierResolver";

const CreateVocabularyFromSkosExternal: React.FC = () => {
  const { i18n } = useI18n();
  const [availableVocabularies, setAvailableVocabularies] = React.useState<
    RdfsResource[]
  >([]);
  const dispatch: ThunkDispatch = useDispatch();
  const importExternalSkos = (file: File, rename: Boolean) =>
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
  React.useEffect(() => {
    trackPromise(
      dispatch(getAvailableVocabularies()),
      "import-vocabulary"
    ).then((value) => setAvailableVocabularies(value));
  }, []);

  return (
    <Card id="vocabulary-import" className="mb-3">
      <CardBody>
        <PromiseTrackingMask area="import-vocabulary" />
        <Label className="attribute-label mb-2">
          {i18n("vocabulary.import.dialog.external.message")}
        </Label>
        <ImportExternalVocabularyDialog
          propKeyPrefix="vocabulary.import"
          getList={availableVocabularies}
          onCreate={importExternalSkos}
          onCancel={() => Routing.transitionTo(Routes.vocabularies)}
          allowRename={true}
        />
      </CardBody>
    </Card>
  );
};

export default CreateVocabularyFromSkosExternal;
