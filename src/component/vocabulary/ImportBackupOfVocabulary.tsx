import { useState } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { GoCloudUpload } from "react-icons/go";
import { useI18n } from "../hook/useI18n";
import IfUserAuthorized from "../authorization/IfUserAuthorized";
import ImportVocabularyPanel from "./ImportVocabularyPanel";

interface ImportVocabularyProps {
  performAction: (file: File, rename: Boolean) => Promise<any>;
}

export const ImportVocabulary = (props: ImportVocabularyProps) => {
  const { i18n } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const toggle = () => setDialogOpen(!dialogOpen);
  const createFile = (file: File, rename: Boolean) =>
    props.performAction(file, rename).then(toggle);

  return (
    <IfUserAuthorized renderUnauthorizedAlert={false}>
      <Modal isOpen={dialogOpen} toggle={toggle}>
        <ModalHeader>
          {i18n("vocabulary.summary.import.dialog.title")}
        </ModalHeader>
        <ModalBody>
          <ImportVocabularyPanel
            propKeyPrefix="vocabulary.summary.import"
            onSubmit={createFile}
            onCancel={toggle}
          />
        </ModalBody>
      </Modal>
      <Button
        className="mb-2"
        color="primary"
        size="sm"
        onClick={toggle}
        title={i18n("vocabulary.summary.import.action.tooltip")}
      >
        <GoCloudUpload className="mr-1" />
        {i18n("vocabulary.summary.import.action")}
      </Button>
    </IfUserAuthorized>
  );
};

export default ImportVocabulary;
