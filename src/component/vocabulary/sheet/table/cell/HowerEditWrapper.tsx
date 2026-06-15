import React from "react";
import { FaPen } from "react-icons/fa";
import { useI18n } from "../../../../hook/useI18n";

interface HoverEditWrapperProps {
  children: React.ReactNode;
  onEdit: () => void;
}

export const HoverEditWrapper: React.FC<HoverEditWrapperProps> = ({
  children,
  onEdit,
}) => {
  const { i18n } = useI18n();

  return (
    <div className="d-flex w-100 align-items-start justify-content-between term-cell-editor-wrapper">
      <div className="flex-grow-1 overflow-hidden">{children}</div>

      <button
        type="button"
        className="cell-edit-button flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title={i18n("edit")}
      >
        <FaPen size={12} />
      </button>
    </div>
  );
};
