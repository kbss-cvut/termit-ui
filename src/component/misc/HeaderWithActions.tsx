import React from "react";
import "./HeaderWithActions.scss";
import classNames from "classnames";
import {ButtonToolbar} from "reactstrap";

interface HeaderWithActionsProps {
    title: JSX.Element | string;
    actions?: JSX.Element[] | JSX.Element | null;
    className?: string;
    id?: string;
}

const HeaderWithActions: React.FC<HeaderWithActionsProps> = props => (
    <div className={classNames("d-flex", "flex-wrap", "justify-content-between", props.className)}>
        <h2 className="page-header">{props.title}</h2>
        {props.actions && <ButtonToolbar className="mb-3 align-items-start">{props.actions}</ButtonToolbar>}
    </div>
);

export default HeaderWithActions;
