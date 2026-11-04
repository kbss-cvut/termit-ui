import React from "react";
import { useI18n } from "../hook/useI18n";
import {
  Button,
  ButtonToolbar,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

interface ConfirmCancelDialogProps {
  show: boolean;
  onClose: () => void;

  onConfirm: () => void;

  id: string;
  title: string;
  confirmKey: string;
  confirmColor?: string;
  confirmDisabled?: boolean;
  cancelKey?: string;
  cancelColor?: string;
  size?: "lg" | "sm";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Generic dialog with confirm and cancel buttons. Body of the dialog is specified via React children.
 */
const ConfirmCancelDialog: React.FC<ConfirmCancelDialogProps> = (props) => {
  const { i18n } = useI18n();
  const {
    confirmColor = "primary",
    confirmDisabled = false,
    cancelKey = "cancel",
    cancelColor = "outline-dark",
  } = props;

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
            color={confirmColor}
            size="sm"
            disabled={confirmDisabled}
            onClick={props.onConfirm}
          >
            {i18n(props.confirmKey)}
          </Button>
          <Button
            id={`${props.id}-cancel`}
            color={cancelColor}
            size="sm"
            onClick={props.onClose}
          >
            {i18n(cancelKey)}
          </Button>
        </ButtonToolbar>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmCancelDialog;
