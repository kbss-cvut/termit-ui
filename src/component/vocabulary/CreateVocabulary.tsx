import Routes from "../../util/Routes";
import Routing from "../../util/Routing";
import Vocabulary from "../../model/Vocabulary";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import VocabularyUtils from "../../util/VocabularyUtils";
import HeaderWithActions from "../misc/HeaderWithActions";
import {
  createFileInDocument,
  createVocabulary,
  uploadFileContent,
} from "../../action/AsyncActions";
import TermItFile from "../../model/File";
import Utils from "../../util/Utils";
import NotificationType from "../../model/NotificationType";
import { publishNotification } from "../../action/SyncActions";
import IdentifierResolver from "../../util/IdentifierResolver";
import WindowTitle from "../misc/WindowTitle";
import * as React from "react";
import { useState } from "react";
import TermItState from "../../model/TermItState";
import CreateVocabularyForm from "./CreateVocabularyForm";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { useI18n } from "../hook/useI18n";

const CreateVocabulary: React.FC = () => {
  const { i18n } = useI18n();
  const configuredLanguage = useSelector(
    (state: TermItState) => state.configuration.language
  );
  const [language, setLanguage] = useState(configuredLanguage);
  const dispatch: ThunkDispatch = useDispatch();

  const onCreate = (
    vocabulary: Vocabulary,
    files: TermItFile[],
    fileContents: File[]
  ) => {
    trackPromise(
      dispatch(createVocabulary(vocabulary)).then((location) => {
        if (!location) {
          return;
        }
        return Promise.all(
          Utils.sanitizeArray(files).map((f, fIndex) =>
            dispatch(
              createFileInDocument(
                f,
                VocabularyUtils.create(vocabulary.document!.iri)
              )
            )
              .then(() =>
                dispatch(
                  uploadFileContent(
                    VocabularyUtils.create(f.iri),
                    fileContents[fIndex]
                  )
                )
              )
              .then(() =>
                dispatch(
                  publishNotification({
                    source: { type: NotificationType.FILE_CONTENT_UPLOADED },
                  })
                )
              )
          )
        ).then(() =>
          Routing.transitionTo(
            Routes.vocabularySummary,
            IdentifierResolver.routingOptionsFromLocation(location)
          )
        );
      }),
      "create-vocabulary"
    );
  };

  return (
    <>
      <WindowTitle title={i18n("vocabulary.create.title")} />
      <HeaderWithActions title={i18n("vocabulary.create.title")} />
      <PromiseTrackingMask area="create-vocabulary" />
      <CreateVocabularyForm
        onSave={onCreate}
        onCancel={() => Routing.transitionTo(Routes.vocabularies)}
        language={language}
        selectLanguage={setLanguage}
      />
    </>
  );
};

export default CreateVocabulary;
