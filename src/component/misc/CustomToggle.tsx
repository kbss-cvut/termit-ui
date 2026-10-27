import React, { CSSProperties } from "react";
import Toggle from "react-bootstrap-toggle";
import "./CustomToggle.scss";

const CustomToggle: React.FC<{
  id?: string;
  on: string;
  off: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
}> = ({ id, on, off, disabled, active, onClick, className, style }) => {
  return (
    <Toggle
      id={id}
      on={on}
      off={off}
      onClick={onClick}
      active={active}
      disabled={disabled}
      onstyle="primary"
      offstyle="secondary"
      size="sm"
      onClassName="toggle-custom"
      offClassName="toggle-custom"
      handleClassName="toggle-handle-custom"
      recalculateOnResize={true}
      className={className}
      style={style}
    />
  );
};

export default CustomToggle;
