import React from "react";
import {
  Button,
  ButtonToolbar,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

interface SingleActionDialogProps {
  show: boolean;
  onClose: () => void;
  onAction: () => void;

  id: string;
  title: string;
  actionButtonText: string;
  actionColor?: string;
  actionDisabled?: boolean;
  size?: "lg" | "sm";
  className?: string;
}

/**
 * Generic dialog with a single button. Body of the dialog is specified via React children.
 */
const SingleActionDialog: React.FC<SingleActionDialogProps> = (props) => {
  return (
    <Modal
      id={props.id}
      isOpen={props.show}
      toggle={props.onClose}
      size={props.size}
      className={props.className}
    >
      <ModalHeader toggle={props.onClose}>{props.title}</ModalHeader>
      <ModalBody>{props.children}</ModalBody>
      <ModalFooter>
        <ButtonToolbar className="float-right">
          <Button
            id={`${props.id}-submit`}
            color={props.actionColor}
            size="sm"
            disabled={props.actionDisabled}
            onClick={props.onAction}
          >
            {props.actionButtonText}
          </Button>
        </ButtonToolbar>
      </ModalFooter>
    </Modal>
  );
};

SingleActionDialog.defaultProps = {
  actionColor: "outline-dark",
  actionDisabled: false,
};

export default SingleActionDialog;
