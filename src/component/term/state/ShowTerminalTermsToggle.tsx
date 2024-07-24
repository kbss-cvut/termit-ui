import React from "react";
import { useI18n } from "../../hook/useI18n";
import Toggle from "react-bootstrap-toggle";
import { UncontrolledTooltip } from "reactstrap";
import { TOGGLE_STYLE } from "../IncludeImportedTermsToggle";

interface ShowTerminalTermsToggleProps {
  onToggle: () => void;
  value: boolean;
  id: string;
}

const ShowTerminalTermsToggle: React.FC<ShowTerminalTermsToggleProps> = ({
  onToggle,
  value,
  id,
}) => {
  const { i18n } = useI18n();
  return (
    <>
      <Toggle
        id={id}
        onClick={onToggle}
        on={i18n("glossary.showTerminal")}
        off={i18n("glossary.showNonTerminal")}
        onstyle="primary"
        offstyle="secondary"
        size="sm"
        onClassName="toggle-custom"
        offClassName="toggle-custom"
        handleClassName="toggle-handle-custom"
        style={TOGGLE_STYLE}
        active={value}
        recalculateOnResize={true}
      />
      <UncontrolledTooltip target={id} placement="right">
        {i18n(
          value ? "glossary.showTerminal.help" : "glossary.showNonTerminal.help"
        )}
      </UncontrolledTooltip>
    </>
  );
};

export default ShowTerminalTermsToggle;
