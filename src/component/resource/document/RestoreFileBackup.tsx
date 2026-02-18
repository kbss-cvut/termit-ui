import { useI18n } from "../../hook/useI18n";
import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { GoArchive } from "react-icons/go";
import TermItFile from "../../../model/File";
import RestoreFileBackupDialog from "../../asset/RestoreFileBackupDialog";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import { loadFileBackupsCount } from "../../../action/AsyncResourceActions";
import VocabularyUtils from "../../../util/VocabularyUtils";

interface RestoreFileBackupProps {
  file: TermItFile;
}

export const RestoreFileBackup = (props: RestoreFileBackupProps) => {
  const { i18n } = useI18n();
  const [showDialog, setShowDialog] = useState(false);
  const [totalBackupCount, setTotalBackupCount] = useState(0);
  const dispatch: ThunkDispatch = useDispatch();

  const toggle = () => setShowDialog(!showDialog);

  useEffect(() => {
    const iri = VocabularyUtils.create(props.file.iri);
    dispatch(loadFileBackupsCount(iri)).then(setTotalBackupCount);
  }, [props.file.iri, dispatch]);

  if (totalBackupCount <= 0) {
    return <></>;
  }

  return (
    <>
      <RestoreFileBackupDialog
        onClose={toggle}
        show={showDialog}
        file={props.file}
        totalBackupsCount={totalBackupCount}
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
