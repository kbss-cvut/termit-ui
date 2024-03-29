import React from "react";
import { AccessControlRecord } from "../../../model/acl/AccessControlList";
import ConfirmCancelDialog from "../../misc/ConfirmCancelDialog";
import { useI18n } from "../../hook/useI18n";
import AccessControlRecordForm from "./AccessControlRecordForm";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";

interface CreateAccessControlRecordProps {
  show: boolean;
  onSubmit: (record: AccessControlRecord<any>) => Promise<any>;
  onCancel: () => void;
  existingHolders?: string[];
}

const CreateAccessControlRecord: React.FC<CreateAccessControlRecordProps> = ({
  show,
  onSubmit,
  onCancel,
  existingHolders,
}) => {
  const { i18n } = useI18n();
  const [record, setRecord] = React.useState<AccessControlRecord<any>>(
    {} as AccessControlRecord<any>
  );
  const onChange = (change: Partial<AccessControlRecord<any>>) => {
    setRecord(Object.assign({}, record, change));
  };
  const submit = () => {
    trackPromise(onSubmit(record), "create-acr-dialog");
    setRecord({} as AccessControlRecord<any>);
  };
  const onClose = () => {
    setRecord({} as AccessControlRecord<any>);
    onCancel();
  };

  return (
    <ConfirmCancelDialog
      show={show}
      id="create-acr"
      confirmKey="save"
      onClose={onClose}
      onConfirm={submit}
      confirmDisabled={!record.holder || !record.accessLevel}
      title={i18n("vocabulary.acl.record.create.dialog.title")}
    >
      <PromiseTrackingMask area="create-acr-dialog" />
      <AccessControlRecordForm
        record={record}
        onChange={onChange}
        existingHolders={existingHolders}
      />
    </ConfirmCancelDialog>
  );
};

export default CreateAccessControlRecord;
