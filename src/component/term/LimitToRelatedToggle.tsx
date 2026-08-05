import React from "react";
import { useI18n } from "../hook/useI18n";
import Toggle from "react-bootstrap-toggle";
import { TOGGLE_STYLE } from "./IncludeImportedTermsToggle";
import { UncontrolledTooltip } from "reactstrap";

interface LimitToRelatedToggleProps {
  onToggle: () => void;
  value: boolean;
  id: string;
}

const LimitToRelatedToggle: React.FC<LimitToRelatedToggleProps> = ({
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
        on={i18n("glossary.limitToRelated")}
        off={i18n("glossary.showAll")}
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
        {i18n(value ? "glossary.limitToRelated.help" : "glossary.showAll.help")}
      </UncontrolledTooltip>
    </>
  );
};

export default LimitToRelatedToggle;
