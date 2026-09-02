import React from "react";
import Term from "../../../../model/Term";
import { TermsTableColumn } from "../table/VocabularySheetViewTableUtils";
import { TermCellEditor } from "../table/cell/TermCellEditor";
import "./TermEditSidebar.scss";
import { BatchTermEditor } from "./BatchTermEditor";
import { TermBatchEditDto } from "../../../../model/TermBatchEditDto";

export interface TermEditSidebarProps {
  isOpen: boolean;
  language: string;
  onClose: () => void;

  term?: Term | null;
  column?: TermsTableColumn | null;
  onSave?: (updatedTerm: Partial<Term>) => Promise<void>;

  inBatchMode?: boolean;
  vocabularyIri: string;
  targetTerms?: Set<string>;
  onBatchSave?: (
    updatedTerm: Omit<TermBatchEditDto, "targetTerms">
  ) => Promise<void>;
}

export const TermEditSidebar: React.FC<TermEditSidebarProps> = ({
  isOpen,
  language,
  onClose,
  term,
  column,
  onSave,
  inBatchMode = false,
  vocabularyIri,
  targetTerms,
  onBatchSave,
}) => {
  return (
    <>
      {isOpen && (
        <div className="term-edit-sidebar-backdrop" onClick={onClose} />
      )}

      <div className={`term-edit-sidebar ${isOpen ? "open" : ""}`}>
        {inBatchMode && onBatchSave ? (
          <BatchTermEditor
            vocabularyIri={vocabularyIri}
            targetTerms={targetTerms || new Set()}
            onSave={onBatchSave}
            onCancel={onClose}
          />
        ) : (
          term &&
          column &&
          onSave && (
            <TermCellEditor
              term={term}
              column={column}
              language={language}
              onCancel={onClose}
              onSave={onSave}
            />
          )
        )}
      </div>
    </>
  );
};
