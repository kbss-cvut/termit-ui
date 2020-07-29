import React from "react";
import "./HeaderWithActions.scss";
import classNames from "classnames";

interface HeaderWithActionsProps {
    title: JSX.Element | string;
    actions?: JSX.Element[] | JSX.Element | null;
    className?: string;
    id?: string;
}

const HeaderWithActions: React.FC<HeaderWithActionsProps> = (props) => (
    <div className={classNames("d-flex", "flex-wrap", "justify-content-between", props.className)}>
        <h2 className="page-header">
            {props.title}
        </h2>
        <div className="mb-3">{props.actions}</div>
    </div>
)

export default HeaderWithActions;