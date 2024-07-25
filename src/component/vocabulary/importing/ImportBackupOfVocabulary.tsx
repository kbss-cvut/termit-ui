import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import ImportVocabularyPanel from "./ImportVocabularyPanel";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";

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
  const onSubmit = (file: File, rename: Boolean) =>
    trackPromise(onImport(file, rename), "vocabulary-import").then(closeDialog);

  return (
    <>
      <Modal isOpen={showDialog} toggle={closeDialog}>
        <ModalHeader>
          {i18n("vocabulary.summary.import.dialog.title")}
        </ModalHeader>
        <ModalBody>
          <PromiseTrackingMask area="vocabulary-import" />
          <ImportVocabularyPanel
            propKeyPrefix="vocabulary.summary.import"
            onSubmit={onSubmit}
            onCancel={closeDialog}
            allowRename={false}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default ImportVocabulary;
