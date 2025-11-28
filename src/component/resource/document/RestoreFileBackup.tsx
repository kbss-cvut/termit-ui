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
  const [showDialog, setShowDialog] = useState(false);
  const toggle = () => setShowDialog(!showDialog);

  return (
    <>
      <RestoreFileBackupDialog
        onClose={toggle}
        show={showDialog}
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
