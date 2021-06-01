import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
} from "reactstrap";
import { GoCloudUpload } from "react-icons/go";
import { UploadFileDialog } from "./UploadFileDialog";
import { useI18n } from "../hook/useI18n";
import IfUserAuthorized from "../authorization/IfUserAuthorized";

interface ImportVocabularyProps {
  performAction: (file: File) => Promise<any>;
}

export const ImportVocabulary = (props: ImportVocabularyProps) => {
  const { i18n } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const toggle = () => setDialogOpen(!dialogOpen);
  const createFile = (file: File) => props.performAction(file).then(toggle);

  return (
    <IfUserAuthorized renderUnauthorizedAlert={false}>
      <Modal isOpen={dialogOpen} toggle={toggle}>
        <ModalBody>
          <Card id="vocabulary.summary.import">
            <CardHeader color="info">
              <h5>{i18n("vocabulary.summary.import.dialog.title")}</h5>
            </CardHeader>
            <CardBody>
              <UploadFileDialog onCreate={createFile} onCancel={toggle} />
            </CardBody>
          </Card>
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
