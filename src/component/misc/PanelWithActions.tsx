import * as React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import "./PanelWithActions.scss";

interface PanelWithActionsProps {
  title: React.ReactNode | string;
  actions?: React.ReactNode[] | React.ReactNode;
  className?: string;
  id?: string;
}

const PanelWithActions: React.FC<PanelWithActionsProps> = ({
  title,
  actions,
  className,
  id,
  children,
}) => {
  return (
    <Card id={id}>
      <CardHeader
        tag="h4"
        color="primary"
        className="d-flex align-items-center"
      >
        <div className="flex-grow-1">{title}</div>
        <div className="float-right ml-2 flex-grow-0">
          {actions ? actions : ""}
        </div>
      </CardHeader>
      <CardBody className={className}>{children}</CardBody>
    </Card>
  );
};

export default PanelWithActions;
