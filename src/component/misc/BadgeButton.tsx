import * as React from "react";
import classNames from "classnames";
import { Button, ButtonProps } from "reactstrap";
import "./BadgeButton.scss";

export const BadgeButton: React.FC<ButtonProps> = (props) => {
  const { children, className, ...propsToPass } = props;
  const cls = classNames(className, "badge-button");
  return (
    <Button size="sm" className={cls} {...propsToPass}>
      {children}
    </Button>
  );
};

export default BadgeButton;
