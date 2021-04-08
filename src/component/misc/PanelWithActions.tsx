import * as React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import "./PanelWithActions.scss";

interface PanelWithActionsProps {
  title: JSX.Element | string;
  actions?: JSX.Element[] | JSX.Element;
  className?: string;
  id?: string;
}

export default class PanelWithActions extends React.Component<PanelWithActionsProps> {
  public render() {
    const props = this.props;
    return (
      <Card id={this.props.id}>
        <CardHeader
          tag="h4"
          color="primary"
          className="d-flex align-items-center"
        >
          <div className="flex-grow-1">{props.title}</div>
          <div className="ml-2 flex-grow-0 float-right">
            {props.actions ? props.actions : ""}
          </div>
        </CardHeader>
        <CardBody className={props.className}>{props.children}</CardBody>
      </Card>
    );
  }
}
