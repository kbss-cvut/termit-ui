import React from "react";
import { GoTrashcan } from "react-icons/go";
import { UncontrolledTooltip } from "reactstrap";
import classNames from "classnames";
import { useI18n } from "../../hook/useI18n";

const TerminalTermStateIcon: React.FC<{ id: string; className?: string }> = ({
  id,
  className,
}) => {
  const { i18n } = useI18n();
  return (
    <>
      <GoTrashcan id={id} className={classNames("term-tree-icon", className)} />
      <UncontrolledTooltip target={id} placement="right">
        {i18n("term.metadata.status.terminal.help")}
      </UncontrolledTooltip>
    </>
  );
};

export default TerminalTermStateIcon;
