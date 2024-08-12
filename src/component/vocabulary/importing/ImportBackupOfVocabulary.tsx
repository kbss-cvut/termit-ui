import React from "react";
import { Alert, Label, Modal, ModalBody, ModalHeader } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import { FormattedMessage } from "react-intl";
import ImportVocabularyDialog from "./ImportVocabularyDialog";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { downloadExcelTemplate } from "../../../action/AsyncImportActions";
import TermItState from "../../../model/TermItState";

interface ImportVocabularyProps {
  showDialog: boolean;
  onImport: (file: File, rename: Boolean) => Promise<any>;
  closeDialog: () => void;
}

export const ImportVocabulary: React.FC<ImportVocabularyProps> = ({
  showDialog,
  closeDialog,
  onImport,
}) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const onSubmit = (file: File, rename: Boolean) =>
    trackPromise(onImport(file, rename), "vocabulary-import").then(closeDialog);
  const downloadTemplate = () => {
    dispatch(downloadExcelTemplate());
  };
  const vocabularyNotEmpty =
    (useSelector((state: TermItState) => state.vocabulary.termCount) || 0) > 0;

  return (
    <>
      <Modal isOpen={showDialog} toggle={closeDialog}>
        <ModalHeader>
          {i18n("vocabulary.summary.import.dialog.title")}
        </ModalHeader>
        <ModalBody>
          <PromiseTrackingMask area="vocabulary-import" />
          <Label className="attribute-label mb-2">
            <FormattedMessage id="vocabulary.summary.import.dialog.label" />
          </Label>
          <ul>
            <li>
              <FormattedMessage id="vocabulary.summary.import.dialog.skosImport" />
            </li>
            <li>
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
            </li>
          </ul>
          {vocabularyNotEmpty && (
            <Alert color="warning">
              <FormattedMessage id="vocabulary.summary.import.nonEmpty.warning" />
            </Alert>
          )}
          <ImportVocabularyDialog
            propKeyPrefix="vocabulary.summary.import"
            onCreate={onSubmit}
            onCancel={closeDialog}
            allowRename={false}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default ImportVocabulary;
