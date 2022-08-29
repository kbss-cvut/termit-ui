import React from "react";
import { useI18n } from "../hook/useI18n";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { Label } from "reactstrap";

interface CreateSnapshotDialogProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CreateSnapshotDialog: React.FC<CreateSnapshotDialogProps> = ({
  show,
  onClose,
  onConfirm,
}) => {
  const { i18n } = useI18n();

  return (
    <ConfirmCancelDialog
      show={show}
      id="create-snapshot"
      confirmKey="vocabulary.snapshot.create.dialog.confirm"
      onClose={onClose}
      onConfirm={onConfirm}
      title={i18n("vocabulary.snapshot.create.label")}
    >
      <Label>{i18n("vocabulary.snapshot.create.dialog.text")}</Label>
    </ConfirmCancelDialog>
  );
};

export default CreateSnapshotDialog;
