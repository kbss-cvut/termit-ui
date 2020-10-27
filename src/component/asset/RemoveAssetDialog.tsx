import * as React from "react";
import {injectIntl} from "react-intl";
import Asset from "../../model/Asset";
import {Button, ButtonToolbar, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Utils from "../../util/Utils";
import Constants from "../../util/Constants";

interface RemoveAssetDialogProps extends HasI18n {
    show: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    asset: Asset;
}

const RemoveAssetDialog: React.SFC<RemoveAssetDialogProps> = (props) => {
    const typeLabelId = Utils.getAssetTypeLabelId(props.asset);
    const typeLabel = props.i18n(typeLabelId ? typeLabelId : "type.asset").toLowerCase();
    return <Modal isOpen={props.show} toggle={props.onCancel}>
        <ModalHeader toggle={props.onCancel}>{props.formatMessage("asset.remove.dialog.title", {
            type: typeLabel,
            label: props.asset.label
        })}</ModalHeader>
        <ModalBody>
            <Label>{props.formatMessage("asset.remove.dialog.text", {
                type: typeLabel,
                label: props.asset.label
            })}</Label>
        </ModalBody>
        <ModalFooter>
            <ButtonToolbar className="pull-right">
                <Button id="remove-asset-submit" color={Constants.SUBMIT_BUTTON_VARIANT} size="sm"
                        onClick={props.onSubmit}>{props.i18n("remove")}</Button>
                <Button id="remove-asset-cancel" color={Constants.CANCEL_BUTTON_VARIANT} size="sm"
                        onClick={props.onCancel}>{props.i18n("cancel")}</Button>
            </ButtonToolbar>
        </ModalFooter>
    </Modal>;
};

export default injectIntl(withI18n(RemoveAssetDialog));
