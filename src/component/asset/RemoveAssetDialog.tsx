import * as React from "react";
import Asset from "../../model/Asset";
import { Label } from "reactstrap";
import Utils from "../../util/Utils";
import { useI18n } from "../hook/useI18n";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";

interface RemoveAssetDialogProps {
  show: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  asset: Asset;
}

const RemoveAssetDialog: React.FC<RemoveAssetDialogProps> = (props) => {
  const { i18n, formatMessage } = useI18n();
  const typeLabelId = Utils.getAssetTypeLabelId(props.asset);
  const typeLabel = i18n(
    typeLabelId ? typeLabelId : "type.asset"
  ).toLowerCase();
  return (
    <ConfirmCancelDialog
      show={props.show}
      id="remove-asset"
      onClose={props.onCancel}
      onConfirm={props.onSubmit}
      title={formatMessage("asset.remove.dialog.title", {
        type: typeLabel,
        label: props.asset.getLabel(),
      })}
      confirmKey="remove"
    >
      <Label>
        {formatMessage("asset.remove.dialog.text", {
          type: typeLabel,
          label: props.asset.getLabel(),
        })}
      </Label>
    </ConfirmCancelDialog>
  );
};

export default RemoveAssetDialog;
