import React from "react";
import { useI18n } from "src/component/hook/useI18n";
import Toggle from "react-bootstrap-toggle";
import { TOGGLE_STYLE } from "../IncludeImportedTermsToggle";
import { UncontrolledTooltip } from "reactstrap";

interface ShowFlatListToggleProps {
  onToggle: () => void;
  value: boolean;
  id: string;
}

const ShowFlatListToggle: React.FC<ShowFlatListToggleProps> = ({
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
        on={i18n("glossary.showFlatList")}
        off={i18n("glossary.showTreeList")}
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
          value ? "glossary.showFlatList.help" : "glossary.showTreeList.help"
        )}
      </UncontrolledTooltip>
    </>
  );
};

export default ShowFlatListToggle;
