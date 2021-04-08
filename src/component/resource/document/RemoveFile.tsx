import * as React from "react";
import {useState} from "react";
import {Button} from "reactstrap";
import File from "../../../model/File";
import RemoveAssetDialog from "../../asset/RemoveAssetDialog";
import {FaTrashAlt} from "react-icons/fa";
import IfUserAuthorized from "../../authorization/IfUserAuthorized";
import {useI18n} from "../../hook/useI18n";

interface RemoveFileProps {
    performAction: () => Promise<void>;
    withConfirmation: boolean;
    file: File;
}

export const RemoveFile = (props: RemoveFileProps) => {
    const {i18n} = useI18n();
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const toggle = () => setConfirmationDialogOpen(!confirmationDialogOpen);

    const performAction = () => {
        props.performAction().then(toggle);
    };

    return (
        <IfUserAuthorized renderUnauthorizedAlert={false}>
            <RemoveAssetDialog
                onCancel={toggle}
                onSubmit={performAction}
                show={confirmationDialogOpen}
                asset={props.file}
            />
            <Button
                color="outline-danger"
                size="sm"
                onClick={props.withConfirmation ? toggle : performAction}
                title={i18n("asset.remove.tooltip")}>
                <FaTrashAlt className="mr-1" />
                {i18n("remove")}
            </Button>
        </IfUserAuthorized>
    );
};

export default RemoveFile;
