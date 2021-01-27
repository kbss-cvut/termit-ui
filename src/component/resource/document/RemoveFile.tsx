import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {
    Button
} from "reactstrap";
import {injectIntl} from "react-intl";
import {useState} from "react";
import File from "../../../model/File";
import RemoveAssetDialog from "../../asset/RemoveAssetDialog";
import {FaTrashAlt} from "react-icons/fa";

interface RemoveFileProps extends HasI18n {
    performAction: () => Promise<void>;
    withConfirmation: boolean;
    file: File;
}

export const RemoveFile = (props: RemoveFileProps) => {

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const toggle = () => setConfirmationDialogOpen(!confirmationDialogOpen);

    const performAction = () => {
        props.performAction()
            .then(toggle)
    };

    return <>
        <RemoveAssetDialog onCancel={toggle} onSubmit={performAction} show={confirmationDialogOpen} asset={props.file}/>
        <Button className="mb-2" color="outline-danger" size="sm" onClick={props.withConfirmation ? toggle : performAction}
                title={props.i18n("asset.remove.tooltip")}>
            <FaTrashAlt/>&nbsp;{props.i18n("remove")}
        </Button>
    </>;
}

export default injectIntl(withI18n(RemoveFile));