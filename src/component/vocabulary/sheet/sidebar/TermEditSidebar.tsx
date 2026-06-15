import React from "react";
import Term from "../../../../model/Term";
import { TermsTableColumn } from "../table/VocabularySheetViewTableUtils";
import { TermCellEditor } from "../table/cell/TermCellEditor";
import "./TermEditSidebar.scss";

export interface TermEditSidebarProps {
  isOpen: boolean;
  term: Term | null;
  column: TermsTableColumn | null;
  language: string;
  onClose: () => void;
  onSave: (updatedTerm: Partial<Term>) => Promise<void>;
}

export const TermEditSidebar: React.FC<TermEditSidebarProps> = ({
  isOpen,
  term,
  column,
  language,
  onClose,
  onSave,
}) => {
  return (
    <>
      {isOpen && (
        <div className="term-edit-sidebar-backdrop" onClick={onClose} />
      )}

      <div className={`term-edit-sidebar ${isOpen ? "open" : ""}`}>
        {term && column && (
          <TermCellEditor
            term={term}
            column={column}
            language={language}
            onCancel={onClose}
            onSave={onSave}
          />
        )}
      </div>
    </>
  );
};
