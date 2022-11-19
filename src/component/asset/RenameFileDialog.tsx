import * as React from "react";
import { useI18n } from "../hook/useI18n";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import TermItFile from "../../model/File";
import { useState } from "react";
import CustomInput from "../misc/CustomInput";
import Utils from "../../util/Utils";

interface RenameFileDialogProps {
  show: boolean;
  onSubmit: (label: string) => void;
  onCancel: () => void;
  asset: TermItFile;
}

const RenameFileDialog: React.FC<RenameFileDialogProps> = (props) => {
  const { i18n, formatMessage } = useI18n();

  const typeLabelId = Utils.getAssetTypeLabelId(props.asset);
  const typeLabel = i18n(
    typeLabelId ? typeLabelId : "type.asset"
  ).toLowerCase();

  const [label, setLabel] = useState(props.asset.getLabel());

  const setFileLabel = (label: string) => {
    setLabel(label);
  };

  const onConfirmHandler = () => {
    props.onSubmit(label);
  };

  return (
    <ConfirmCancelDialog
      show={props.show}
      id="rename-asset"
      onClose={props.onCancel}
      onConfirm={onConfirmHandler}
      title={formatMessage("asset.rename.dialog.title", {
        type: typeLabel,
        label: props.asset.getLabel(),
      })}
      confirmKey="save"
    >
      <CustomInput
        name="edit-file-label"
        label={i18n("asset.label")}
        value={label}
        onChange={(e) => setFileLabel(e.currentTarget.value)}
      />
    </ConfirmCancelDialog>
  );
};

export default RenameFileDialog;
