import * as React from "react";
import {Button, ButtonProps} from "reactstrap";
import "./BadgeButton.scss";
import classNames from "classnames";

export const BadgeButton:React.FC<ButtonProps> = props => {
    const {children, className, ...propsToPass} = props;
    const cls = classNames(className, "badge-button");
    return <Button size="sm" className={cls} {...propsToPass}>{children}</Button>
};

export default BadgeButton;