import * as React from "react";
import { UncontrolledTooltip } from "reactstrap";
import Toggle from "react-bootstrap-toggle";
import "./IncludeImportedTermsToggle.scss";
import { useI18n } from "../hook/useI18n";

interface IncludeImportedTermsToggleProps {
  onToggle: () => void;
  includeImported: boolean;
  id: string; // Toggle id, required by the tooltip component
  disabled?: boolean;
  style?: object;
}

const IncludeImportedTermsToggle: React.FC<IncludeImportedTermsToggleProps> = (
  props
) => {
  const { i18n } = useI18n();
  let toggleStyle = {
    height: "calc(1.5 * 0.875rem + 0.5rem + 2px)",
    margin: "0 0 0.125rem 0",
  };
  if (props.style) {
    toggleStyle = Object.assign(toggleStyle, props.style);
  }
  return (
    <>
      <Toggle
        id={props.id}
        onClick={props.onToggle}
        on={i18n("glossary.includeImported")}
        off={i18n("glossary.excludeImported")}
        disabled={props.disabled}
        onstyle="primary"
        offstyle="secondary"
        size="sm"
        onClassName="toggle-custom"
        offClassName="toggle-custom"
        handleClassName="toggle-handle-custom"
        style={toggleStyle}
        active={props.includeImported}
        recalculateOnResize={true}
      />
      <UncontrolledTooltip target={props.id} placement="right">
        {i18n(
          props.includeImported
            ? "glossary.includeImported.help"
            : "glossary.excludeImported.help"
        )}
      </UncontrolledTooltip>
    </>
  );
};

export default IncludeImportedTermsToggle;
