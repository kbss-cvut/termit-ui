import * as React from "react";
import { useI18n } from "../hook/useI18n";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import TermItFile from "../../model/File";
import { useState } from "react";
import CustomInput from "../misc/CustomInput";
import Utils from "../../util/Utils";
import UploadFile from "../resource/file/UploadFile";
import { FormGroup, Label } from "reactstrap";

interface ModifyFileDialogProps {
  show: boolean;
  onSubmit: (label: string, file?: File) => void;
  onCancel: () => void;
  asset: TermItFile;
}

const ModifyFileDialog: React.FC<ModifyFileDialogProps> = (props) => {
  const [file, setFile] = useState<File>();
  const { i18n, formatMessage } = useI18n();

  const typeLabelId = Utils.getAssetTypeLabelId(props.asset);
  const typeLabel = i18n(
    typeLabelId ? typeLabelId : "type.asset"
  ).toLowerCase();

  const [label, setLabel] = useState(props.asset.getLabel());

  return (
    <ConfirmCancelDialog
      show={props.show}
      id="rename-asset"
      onClose={props.onCancel}
      onConfirm={() => props.onSubmit(label, file)}
      title={formatMessage("asset.modify.dialog.title", {
        type: typeLabel,
        label: props.asset.getLabel(),
      })}
      confirmKey="save"
    >
      <FormGroup>
        <Label className={"attribute-label"}>
          {i18n("resource.reupload.file.select.label")}
        </Label>
        <UploadFile setFile={setFile} />
        <CustomInput
          name="edit-file-label"
          label={i18n("asset.label")}
          value={label}
          onChange={(e) => setLabel(e.currentTarget.value)}
        />
      </FormGroup>
    </ConfirmCancelDialog>
  );
};

export default ModifyFileDialog;
