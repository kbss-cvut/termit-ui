import * as React from "react";
import { useEffect, useState } from "react";
import { useI18n } from "../hook/useI18n";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import TermItFile from "../../model/File";
import { FormGroup, Label } from "reactstrap";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { loadFileBackups } from "../../action/AsyncResourceActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import FileBackupList from "./FileBackupList";
import FileBackupDto from "../../model/FileBackupDto";

interface RestoreFileBackupDialogProps {
  show: boolean;
  // onSubmit: (label: string, file?: File) => void;
  onCancel: () => void;
  file: TermItFile;
}

const FILE_BACKUP_LIST_PROMISE_AREA = "file-backup-list";

const RestoreFileBackupDialog: React.FC<RestoreFileBackupDialogProps> = (
  props
) => {
  const [backups, setBackups] = useState<FileBackupDto[]>([]);
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  /*
  const typeLabelId = Utils.getAssetTypeLabelId(props.asset);
  const typeLabel = i18n(
    typeLabelId ? typeLabelId : "type.asset"
  ).toLowerCase();

  const [label, setLabel] = useState(props.asset.getLabel());
*/
  useEffect(() => {
    const iri = VocabularyUtils.create(props.file.iri);
    trackPromise(
      dispatch(loadFileBackups(iri)),
      FILE_BACKUP_LIST_PROMISE_AREA
    ).then((array) => {
      if (array) {
        setBackups(array);
      }
    });
  }, [props.file]);

  return (
    <ConfirmCancelDialog
      show={props.show}
      id="rename-asset"
      onClose={props.onCancel}
      onConfirm={() => {}}
      title={"TODO: placeholder"} // TODO: replace
      /*
      onConfirm={() => props.onSubmit(label, file)}
      title={formatMessage("asset.modify.dialog.title", {
        type: typeLabel,
        label: props.asset.getLabel(),
      })}*/
      confirmKey="save"
    >
      <PromiseTrackingMask area={FILE_BACKUP_LIST_PROMISE_AREA} />
      <FormGroup>
        <Label className={"attribute-label"}>
          {i18n("resource.reupload.file.select.label")}
        </Label>

        <FileBackupList backups={backups} />
      </FormGroup>
    </ConfirmCancelDialog>
  );
};

export default RestoreFileBackupDialog;
