import { useState } from "react";
import { DropdownItem, Modal, ModalBody, ModalHeader } from "reactstrap";
import { GoCloudUpload } from "react-icons/go";
import { useI18n } from "../hook/useI18n";
import ImportVocabularyPanel from "./ImportVocabularyPanel";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";

interface ImportVocabularyProps {
  performAction: (file: File, rename: Boolean) => Promise<any>;
}

export const ImportVocabulary = (props: ImportVocabularyProps) => {
  const { i18n } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const toggle = () => setDialogOpen(!dialogOpen);
  const onSubmit = (file: File, rename: Boolean) =>
    trackPromise(props.performAction(file, rename), "vocabulary-import").then(
      toggle
    );

  return (
    <>
      <Modal isOpen={dialogOpen} toggle={toggle}>
        <ModalHeader>
          {i18n("vocabulary.summary.import.dialog.title")}
        </ModalHeader>
        <ModalBody>
          <PromiseTrackingMask area="vocabulary-import" />
          <ImportVocabularyPanel
            propKeyPrefix="vocabulary.summary.import"
            onSubmit={onSubmit}
            onCancel={toggle}
            allowRename={false}
          />
        </ModalBody>
      </Modal>
      <DropdownItem
        className="btn-sm"
        onClick={toggle}
        title={i18n("vocabulary.summary.import.action.tooltip")}
      >
        <GoCloudUpload className="mr-1" />
        {i18n("vocabulary.summary.import.action")}
      </DropdownItem>
    </>
  );
};

export default ImportVocabulary;
