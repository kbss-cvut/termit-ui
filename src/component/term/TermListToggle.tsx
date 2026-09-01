import * as React from "react";
import { UncontrolledTooltip } from "reactstrap";
import Toggle from "react-bootstrap-toggle";
import { useI18n } from "../hook/useI18n";
import "../misc/CustomToggle.scss";

export const TOGGLE_STYLE = {
  height: "calc(1.5 * 0.875rem + 0.5rem + 2px)",
  margin: "0 0 0.125rem 0",
};

interface TermListToggleProps {
  id: string; // Toggle id, required by the tooltip component
  value: boolean;
  onToggle: () => void;
  labelOnKey: string;
  labelOffKey: string;
  tooltipOnKey: string;
  tooltipOffKey: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/**
 * One custom toggle button used for multiple term list toggles, e.g. for
 * including/excluding imported terms, related terms or for changing the list
 * from flat list to tree view.
 *
 * @param id the id of the toggle button, required by the tooltip component
 * @param value the current value of the toggle button
 * @param onToggle the callback function to be called when the toggle button is clicked
 * @param labelOnKey the key for the label when the toggle is on
 * @param labelOffKey the key for the label when the toggle is off
 * @param tooltipOnKey the key for the tooltip when the toggle is on
 * @param tooltipOffKey the key for the tooltip when the toggle is off
 * @param disabled (optional) whether the toggle is disabled
 * @param style (optional) custom style for the toggle button
 * @returns the toggle button component
 */
const TermListToggle: React.FC<TermListToggleProps> = ({
  id,
  value,
  onToggle,
  labelOnKey,
  labelOffKey,
  tooltipOnKey,
  tooltipOffKey,
  disabled,
  style,
}) => {
  const { i18n } = useI18n();
  const toggleStyle = { ...TOGGLE_STYLE, ...style };

  return (
    <>
      <Toggle
        id={id}
        onClick={onToggle}
        on={i18n(labelOnKey as any)}
        off={i18n(labelOffKey as any)}
        disabled={disabled}
        onstyle="primary"
        offstyle="secondary"
        size="sm"
        onClassName="toggle-custom"
        offClassName="toggle-custom"
        handleClassName="toggle-handle-custom"
        style={toggleStyle}
        active={value}
        recalculateOnResize={true}
      />
      <UncontrolledTooltip target={id} placement="right">
        {i18n((value ? tooltipOnKey : tooltipOffKey) as any)}
      </UncontrolledTooltip>
    </>
  );
};

export default TermListToggle;
