import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import CreateVocabularyForm from "../CreateVocabularyForm";
import Routes from "../../../util/Routes";
import Routing from "../../../util/Routing";
import { ThunkDispatch } from "../../../util/Types";
import Vocabulary from "../../../model/Vocabulary";
import TermItFile from "../../../model/File";
import { trackPromise } from "react-promise-tracker";
import {
  createFileInDocument,
  createVocabulary,
  uploadFileContent,
} from "../../../action/AsyncActions";
import Utils from "../../../util/Utils";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { publishNotification } from "../../../action/SyncActions";
import NotificationType from "../../../model/NotificationType";
import IdentifierResolver from "../../../util/IdentifierResolver";
import { Col, Label, Row } from "reactstrap";
import UploadFile from "../../resource/file/UploadFile";
import {
  downloadExcelTemplate,
  importIntoExistingVocabulary,
} from "../../../action/AsyncImportActions";
import { FormattedMessage } from "react-intl";
import { useI18n } from "../../hook/useI18n";

const CreateVocabularyFromExcel: React.FC = () => {
  const { i18n } = useI18n();
  const configuredLanguage = useSelector(
    (state: TermItState) => state.configuration.language
  );
  const [language, setLanguage] = React.useState(configuredLanguage);
  const [file, setFile] = useState<File>();
  const dispatch: ThunkDispatch = useDispatch();
  const downloadTemplate = () => {
    dispatch(downloadExcelTemplate());
  };
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
        )
          .then(() => {
            if (file) {
              return dispatch(
                importIntoExistingVocabulary(
                  VocabularyUtils.create(vocabulary.iri),
                  file
                )
              );
            }
            return Promise.resolve({});
          })
          .then(() =>
            Routing.transitionTo(
              Routes.vocabularySummary,
              IdentifierResolver.routingOptionsFromLocation(location)
            )
          );
      }),
      "import-excel-vocabulary"
    );
  };

  return (
    <>
      <PromiseTrackingMask area="import-excel-vocabulary" />
      <CreateVocabularyForm
        onSave={onCreate}
        onCancel={() => Routing.transitionTo(Routes.vocabularies)}
        language={language}
        selectLanguage={setLanguage}
        childrenBefore={
          <Row className="mb-3">
            <Col xs={12}>
              <Label className="attribute-label mb-2">
                <FormattedMessage
                  id="vocabulary.summary.import.dialog.excelImport"
                  values={{
                    a: (chunks: any) => (
                      <span
                        role="button"
                        className="bold btn-link link-like"
                        onClick={downloadTemplate}
                        title={i18n(
                          "vocabulary.summary.import.excel.template.tooltip"
                        )}
                      >
                        {chunks}
                      </span>
                    ),
                  }}
                />
              </Label>
              <UploadFile setFile={(file) => setFile(file)} />
            </Col>
          </Row>
        }
      />
    </>
  );
};

export default CreateVocabularyFromExcel;
