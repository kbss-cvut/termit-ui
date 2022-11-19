import * as React from "react";
import { useI18n } from "../hook/useI18n";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import TermItFile from "../../model/File";
import { useState } from "react";
import CustomInput from "../misc/CustomInput";
import Utils from "../../util/Utils";

interface RenameFileDialogProps {
  show: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  asset: TermItFile;
}

const RenameFileDialog: React.FC<RenameFileDialogProps> = (props) => {
  const { i18n, formatMessage } = useI18n();

  const typeLabelId = Utils.getAssetTypeLabelId(props.asset);
  const typeLabel = i18n(
    typeLabelId ? typeLabelId : "type.asset"
  ).toLowerCase();
  const [labelOriginal] = useState(props.asset.getLabel());
  const [label, setLabel] = useState(props.asset.getLabel());

  const setFileLabel = (label: string) => {
    props.asset.label = label;
    setLabel(label);
  };

  return (
    <ConfirmCancelDialog
      show={props.show}
      id="rename-asset"
      onClose={props.onCancel}
      onConfirm={props.onSubmit}
      title={formatMessage("asset.rename.dialog.title", {
        type: typeLabel,
        label: labelOriginal,
      })}
      confirmKey="edit"
    >
      <CustomInput
        name="edit-file-label"
        label={i18n("asset.label")}
        value={label}
        onChange={(e) => setFileLabel(e.currentTarget.value)}
        hint={i18n("required")}
      />
    </ConfirmCancelDialog>
  );
};

export default RenameFileDialog;
