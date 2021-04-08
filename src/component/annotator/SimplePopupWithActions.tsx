import * as React from "react";
import { ButtonToolbar, Popover, PopoverBody, PopoverHeader } from "reactstrap";

interface PopupWithActionsProps {
  title: string;
  actions: JSX.Element[];
  component: JSX.Element;
  isOpen: boolean;
  target: any;
  toggle: any;
}

const handler = (e: any) => {
  e.stopPropagation();
};

const SimplePopupWithActions: React.FC<PopupWithActionsProps> = (props) => {
  if (!props.isOpen) {
    return null;
  }
  return (
    <Popover
      placement="auto"
      popperClassName="pwa"
      trigger="focus"
      isOpen={props.isOpen}
      target={props.target}
      toggle={props.toggle}
    >
      <div onClick={handler}>
        <PopoverHeader className="d-flex align-items-center">
          <div className="pwa-popup-title flex-grow-1">{props.title}</div>
          <ButtonToolbar className="float-sm-right">
            {props.actions}
          </ButtonToolbar>
        </PopoverHeader>
        <PopoverBody>{props.component}</PopoverBody>
      </div>
    </Popover>
  );
};

export default SimplePopupWithActions;
