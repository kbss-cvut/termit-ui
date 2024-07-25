import React from "react";
import { Label, Modal, ModalBody, ModalHeader } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import { FormattedMessage } from "react-intl";
import ImportVocabularyDialog from "./ImportVocabularyDialog";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { downloadExcelTemplate } from "../../../action/AsyncImportActions";

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

  return (
    <>
      <Modal isOpen={showDialog} toggle={closeDialog}>
        <ModalHeader>
          {i18n("vocabulary.summary.import.dialog.title")}
        </ModalHeader>
        <ModalBody>
          <PromiseTrackingMask area="vocabulary-import" />
          <Label className="attribute-label mb-2">
            <FormattedMessage
              id="vocabulary.summary.import.dialog.message"
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
