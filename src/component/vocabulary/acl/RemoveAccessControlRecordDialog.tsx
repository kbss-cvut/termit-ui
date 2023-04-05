import React from "react";
import { useI18n } from "../../hook/useI18n";
import { AccessControlRecordData } from "../../../model/AccessControlList";
import ConfirmCancelDialog from "../../misc/ConfirmCancelDialog";
import { Label } from "reactstrap";
import { getLocalized } from "../../../model/MultilingualString";

interface RemoveAccessControlRecordDialogProps {
  record?: AccessControlRecordData;
  show: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const RemoveAccessControlRecordDialog: React.FC<RemoveAccessControlRecordDialogProps> =
  ({ record, show, onSubmit, onCancel }) => {
    const { i18n, formatMessage, locale } = useI18n();
    if (!record) {
      return null;
    }

    return (
      <ConfirmCancelDialog
        show={show}
        id="remove-acr"
        confirmKey="remove"
        onClose={onCancel}
        onConfirm={onSubmit}
        title={i18n("vocabulary.acl.record.remove.dialog.title")}
      >
        <Label>
          {formatMessage("vocabulary.acl.record.remove.dialog.text", {
            holder: getLocalized(record.holder.label, locale),
          })}
        </Label>
      </ConfirmCancelDialog>
    );
  };

export default RemoveAccessControlRecordDialog;
