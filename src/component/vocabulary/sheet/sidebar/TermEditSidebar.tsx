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
  selectedTerms?: Term[];
  selectedTermIris?: Set<string>;
  onBatchSave?: (
    updatedTerm: Omit<TermBatchEditDto, "targetTerms">
  ) => Promise<void>;
}

/**
 * A sidebar component for editing a term or batch of terms in a vocabulary
 * sheet.
 * It can operate in two modes: single term edit mode and batch edit mode. In
 * single term edit mode, it displays a TermCellEditor for editing a specific
 * term. In batch edit mode, it displays a BatchTermEditor for editing
 * properties of multiple terms.
 * @param isOpen whether the sidebar is open or closed.
 * @param language the current language for displaying term information.
 * @param onClose a callback function to handle closing the sidebar.
 * @param term the term to be edited in single term edit mode
 * @param column the column of the term to be edited in single term edit mode
 * @param onSave a callback function to handle saving the edited term
 * @param inBatchMode whether the sidebar is in batch edit mode; false by default
 * @param vocabularyIri the IRI of the vocabulary in which the terms are being edited
 * @param selectedTerms the terms selected for batch editing
 * @param selectedTermIris the IRIs of the terms selected for batch editing. This is used to quickly filter the selected terms.
 * @param onBatchSave a callback function to handle saving the batch edited terms
 * @returns
 */
export const TermEditSidebar: React.FC<TermEditSidebarProps> = ({
  isOpen,
  language,
  onClose,
  term,
  column,
  onSave,
  inBatchMode = false,
  vocabularyIri,
  selectedTerms,
  selectedTermIris,
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
            language={language}
            selectedTerms={selectedTerms || []}
            selectedTermIris={selectedTermIris || new Set<string>()}
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
