import * as React from "react";
import Asset from "../../model/Asset";
import {
  Button,
  ButtonToolbar,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import Utils from "../../util/Utils";
import { useI18n } from "../hook/useI18n";
import Constants from "../../util/Constants";

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
    <Modal isOpen={props.show} toggle={props.onCancel}>
      <ModalHeader toggle={props.onCancel}>
        {formatMessage("asset.remove.dialog.title", {
          type: typeLabel,
          label: props.asset.getLabel(),
        })}
      </ModalHeader>
      <ModalBody>
        <Label>
          {formatMessage("asset.remove.dialog.text", {
            type: typeLabel,
            label: props.asset.getLabel(),
          })}
        </Label>
      </ModalBody>
      <ModalFooter>
        <ButtonToolbar className="pull-right">
          <Button
            id="remove-asset-submit"
            color={Constants.SUBMIT_BUTTON_VARIANT}
            size="sm"
            onClick={props.onSubmit}
          >
            {i18n("remove")}
          </Button>
          <Button
            id="remove-asset-cancel"
            color={Constants.CANCEL_BUTTON_VARIANT}
            size="sm"
            onClick={props.onCancel}
          >
            {i18n("cancel")}
          </Button>
        </ButtonToolbar>
      </ModalFooter>
    </Modal>
  );
};

export default RemoveAssetDialog;
