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
  importExternalSkosAsNewVocabulary,
} from "../../../action/AsyncImportActions";
import ImportExternalVocabularyDialog from "./ImportExternalVocabularyDialog";
import RdfsResource from "../../../model/RdfsResource";
import IdentifierResolver from "../../../util/IdentifierResolver";
import * as SyncActions from "../../../action/SyncActions";
import Message from "../../../model/Message";
import MessageType from "../../../model/MessageType";

const CreateVocabularyFromSkosExternal: React.FC = () => {
  const { i18n } = useI18n();
  const [availableVocabularies, setAvailableVocabularies] = React.useState<
    RdfsResource[]
  >([]);
  const dispatch: ThunkDispatch = useDispatch();
  const importExternalSkos = (selectedItems: string[]) =>
    trackPromise(
      dispatch(importExternalSkosAsNewVocabulary(selectedItems, true)),
      "import-vocabulary"
    ).then((location?: string) => {
      if (location) {
        dispatch(
          SyncActions.publishMessage(
            new Message(
              { messageId: "vocabulary.import.success.message" },
              MessageType.SUCCESS
            )
          )
        );
        Routing.transitionTo(
          Routes.vocabularySummary,
          IdentifierResolver.routingOptionsFromLocation(location)
        );
      } else {
        dispatch(
          SyncActions.publishMessage(
            new Message(
              { messageId: "vocabulary.import.error.message" },
              MessageType.ERROR
            )
          )
        );
      }
    });
  React.useEffect(() => {
    trackPromise(
      dispatch(getAvailableVocabularies()),
      "import-vocabulary"
    ).then((value) => setAvailableVocabularies(value));
  }, [dispatch]);

  return (
    <Card id="external-vocabulary-import" className="mb-3">
      <CardBody>
        <PromiseTrackingMask area="import-vocabulary" />
        <Label className="attribute-label mb-2">
          {i18n("vocabulary.import.dialog.external.message")}
        </Label>
        <ImportExternalVocabularyDialog
          vocabularyList={availableVocabularies}
          onCreate={importExternalSkos}
        />
      </CardBody>
    </Card>
  );
};

export default CreateVocabularyFromSkosExternal;
