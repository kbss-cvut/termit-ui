import React, { useEffect, useRef } from "react";
import "./IndeterminateCheckbox.scss";

export interface IndeterminateCheckboxProps {
  id: string;
  className?: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Checkbox component that supports an indeterminate state.
 *
 * @param id the unique identifier for the checkbox input.
 * @param className optional additional CSS classes to apply to the checkbox.
 * @param checked whether the checkbox is checked.
 * @param indeterminate whether the checkbox is in an indeterminate state.
 * @param onChange callback function to handle change events on the checkbox.
 */
export const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
  id,
  className,
  checked = false,
  indeterminate = false,
  onChange,
}) => {
  const el = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (el.current) {
      el.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={el}
      id={id}
      className={`indeterminate-checkbox ${className || ""}`.trim()}
      checked={checked}
      onChange={onChange}
    />
  );
};
