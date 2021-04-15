import * as React from "react";
import {
  Button,
  ButtonToolbar,
  Popover,
  PopoverBody,
  PopoverHeader,
} from "reactstrap";
import { TiTimes } from "react-icons/ti";
import { useI18n } from "../hook/useI18n";

interface SelectionPurposeDialogProps {
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

export const SelectionPurposeDialog: React.FC<SelectionPurposeDialogProps> = (
  props
) => {
  const { i18n } = useI18n();
  if (!props.show || !props.target) {
    return null;
  }
  return (
    <Popover
      id="annotator-selection-dialog"
      placement="auto"
      popperClassName="pwa"
      isOpen={props.show}
      target={props.target}
      toggle={props.onCancel}
    >
      <div onClick={handler}>
        <PopoverHeader className="d-flex align-items-center">
          <div className="flex-grow-1">
            {i18n("annotator.selectionPurpose.dialog.title")}
          </div>
          <div className="ml-2 flex-grow-0 float-right">
            <Button
              id="annotator-selection-dialog-cancel"
              onClick={props.onCancel}
              color="primary"
              size="sm"
            >
              <TiTimes />
            </Button>
          </div>
        </PopoverHeader>
        <PopoverBody>
          <ButtonToolbar>
            <Button
              id="annotator-selection-dialog-mark-occurrence"
              color="primary"
              size="sm"
              onClick={props.onMarkOccurrence}
            >
              {i18n("annotator.selectionPurpose.occurrence")}
            </Button>
            <Button
              id="annotator-selection-dialog-mark-definition"
              color="primary"
              size="sm"
              onClick={props.onMarkDefinition}
            >
              {i18n("annotator.selectionPurpose.definition")}
            </Button>
          </ButtonToolbar>
        </PopoverBody>
      </div>
    </Popover>
  );
};

export default SelectionPurposeDialog;
