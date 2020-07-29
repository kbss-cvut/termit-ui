import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Button, ButtonToolbar, Popover, PopoverBody, PopoverHeader} from "reactstrap";
import {TiTimes} from "react-icons/ti";

interface SelectionPurposeDialogProps extends HasI18n {
    target?: string | HTMLElement;
    show: boolean;
    onCreateTerm: () => void;
    onMarkOccurrence: () => void;
    onMarkDefinition: () => void;
    onCancel: () => void;
}

function handler(e: any) {
    return e.stopPropagation();
}

export const SelectionPurposeDialog: React.FC<SelectionPurposeDialogProps> = props => {
    if (!props.show || !props.target) {
        return null;
    }
    return <Popover id="annotator-selection-dialog" placement="auto" popperClassName="pwa" isOpen={props.show}
                    target={props.target} toggle={props.onCancel}>
        <div onClick={handler}>
            <PopoverHeader className="d-flex">
                <div className="flex-grow-1">
                    {props.i18n("annotator.selectionPurpose.dialog.title")}
                </div>
                <div className="ml-2 flex-grow-0 float-right">
                    <Button id="annotator-selection-dialog-cancel" onClick={props.onCancel} color="secondary" size="sm"><TiTimes/></Button>
                </div>
            </PopoverHeader>
            <PopoverBody>
                <ButtonToolbar>
                    <Button id="annotator-selection-dialog-mark-occurrence" color="primary" size="sm"
                            onClick={props.onMarkOccurrence}>{props.i18n("annotator.selectionPurpose.occurrence")}</Button>
                    <Button id="annotator-selection-dialog-mark-definition" color="primary" size="sm"
                            onClick={props.onMarkDefinition}>{props.i18n("annotator.selectionPurpose.definition")}</Button>
                </ButtonToolbar>
            </PopoverBody>
        </div>
    </Popover>;
};

export default injectIntl(withI18n(SelectionPurposeDialog));
