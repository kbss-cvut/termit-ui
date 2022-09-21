import { useState } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import TermItFile from "../../../model/File";
import { GoPlus } from "react-icons/go";
import VocabularyUtils from "../../../util/VocabularyUtils";
import CreateFileMetadata from "../file/CreateFileMetadata";
import IfUserIsEditor from "../../authorization/IfUserIsEditor";
import { useI18n } from "../../hook/useI18n";

interface AddFileProps {
  performAction: (termitFile: TermItFile, file: File) => Promise<void>;
}

export const AddFile = (props: AddFileProps) => {
  const { i18n } = useI18n();
  const [createFileDialogOpen, setCreateFileDialogOpen] = useState(false);
  const toggle = () => setCreateFileDialogOpen(!createFileDialogOpen);

  const createFile = (termitFile: TermItFile, file: File) => {
    termitFile.addType(VocabularyUtils.FILE);
    return props.performAction(termitFile, file).then(toggle);
  };

  return (
    <IfUserIsEditor>
      <Modal
        id="document-create-file"
        isOpen={createFileDialogOpen}
        toggle={toggle}
      >
        <ModalHeader toggle={toggle}>
          {i18n("resource.metadata.document.files.actions.add.dialog.title")}
        </ModalHeader>
        <ModalBody>
          <CreateFileMetadata onCreate={createFile} onCancel={toggle} />
        </ModalBody>
      </Modal>
      <Button
        className="mb-2"
        color="primary"
        size="sm"
        onClick={toggle}
        title={i18n("resource.metadata.document.files.actions.add.tooltip")}
      >
        <GoPlus className="mr-1" />
        {i18n("resource.metadata.document.files.actions.add")}
      </Button>
    </IfUserIsEditor>
  );
};

export default AddFile;
