import React from "react";
import { AccessControlRecord } from "../../../model/AccessControlList";
import AccessControlRecordForm from "./AccessControlRecordForm";
import ConfirmCancelDialog from "../../misc/ConfirmCancelDialog";
import { useI18n } from "../../hook/useI18n";

interface EditAccessControlRecordDialogProps {
  show: boolean;
  record: AccessControlRecord<any>;
  onChange: (change: Partial<AccessControlRecord<any>>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const EditAccessControlRecordDialog: React.FC<EditAccessControlRecordDialogProps> =
  ({ show, record, onChange, onSubmit, onCancel }) => {
    const { i18n } = useI18n();
    return (
      <ConfirmCancelDialog
        show={show}
        id="create-acr"
        confirmKey="save"
        onClose={onCancel}
        onConfirm={onSubmit}
        confirmDisabled={!record || !record.holder || !record.accessLevel}
        title={i18n("vocabulary.acl.record.update.dialog.title")}
      >
        {record && (
          <AccessControlRecordForm
            record={record}
            onChange={onChange}
            holderReadOnly={true}
          />
        )}
      </ConfirmCancelDialog>
    );
  };

export default EditAccessControlRecordDialog;
