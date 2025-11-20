import { useI18n } from "../../hook/useI18n";
import { useState } from "react";
import { Button } from "reactstrap";
import { GoArchive } from "react-icons/go";
import TermItFile from "../../../model/File";
import RestoreFileBackupDialog from "../../asset/RestoreFileBackupDialog";

interface RestoreFileBackupProps {
  file: TermItFile;
}

export const RestoreFileBackup = (props: RestoreFileBackupProps) => {
  const { i18n } = useI18n();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const toggle = () => setConfirmationDialogOpen(!confirmationDialogOpen);
  /*
  const performAction = (label: string, file?: File) => {
    const modifiedFile = Object.assign({}, props.file, { label: label.trim() });
    props
      .performRename(modifiedFile)
      .then(() => {
        if (file) {
          return props.performFileUpdate(props.file, file);
        } else {
          return Promise.resolve();
        }
      })
      .then(toggle);
  };
 */
  return (
    <>
      <RestoreFileBackupDialog
        onCancel={toggle}
        // onSubmit={}
        show={confirmationDialogOpen}
        file={props.file}
      />
      <Button
        color="primary"
        size="sm"
        onClick={toggle}
        title={i18n("backups")}
      >
        <GoArchive className="mr-1" />
        {i18n("backups")}
      </Button>
    </>
  );
};

export default RestoreFileBackup;
