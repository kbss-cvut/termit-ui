import React from "react";
import { useI18n } from "../hook/useI18n";
import { GoTrashcan } from "react-icons/go";
import { UncontrolledTooltip } from "reactstrap";

const TerminalTermStateIcon: React.FC<{ id: string }> = ({ id }) => {
  const { i18n } = useI18n();
  return (
    <>
      <GoTrashcan id={id} className="term-tree-icon" />
      <UncontrolledTooltip target={id} placement="right">
        {i18n("term.metadata.status.terminal.help")}
      </UncontrolledTooltip>
    </>
  );
};

export default TerminalTermStateIcon;
