import React, { useState } from "react";
import { Collapse, Label } from "reactstrap";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useI18n } from "../../../hook/useI18n";
import Term from "../../../../model/Term";
import { getLocalizedInLanguage } from "../../../../model/MultilingualString";
import { TermListPreview } from "../../../term/TermListPreview";
import { BatchProperty } from "./BatchTermEditor";
import { useSelector } from "react-redux";
import TermItState from "../../../../model/TermItState";
import { resolveTypeLabels } from "../table/VocabularySheetViewTableUtils";

export interface SelectedTermsListProps {
  selectedTerms: Term[];
  selectedProperty: BatchProperty;
  language: string;
  vocabularyIri: string;
}

const resolveProperties = (
  term: Term,
  property: BatchProperty,
  language: string,
  typeOptions: Record<string, Term>
) => {
  switch (property) {
    case "types":
      return resolveTypeLabels(term.types, typeOptions, language);
    case "exactMatchTerms":
      return term.exactMatchTerms || [];
    case "parentTerms":
      return term.parentTerms || [];
    case "relatedMatch":
      return Term.consolidateRelatedAndRelatedMatch(term, language) || [];
    default:
      return [];
  }
};

/**
 * Displays a list of selected terms and their properties in a collapsible format.
 * Each term can be expanded to show its properties based on the selected
 * property (types, exact matches, related matches, or parent terms).
 * @param selectedTerms The list of selected terms to display.
 * @param selectedProperty The property to display for each term.
 * @param language The language for displaying term information.
 * @param vocabularyIri The IRI of the vocabulary, used for displaying vocabulary badges.
 */
export const SelectedTermsList: React.FC<SelectedTermsListProps> = ({
  selectedTerms,
  selectedProperty,
  language,
  vocabularyIri,
}) => {
  const { i18n } = useI18n();
  const [expandedTermIris, setExpandedTermIris] = useState<Set<string>>(
    new Set()
  );
  const typeOptions = useSelector((state: TermItState) => state.types);

  const renderPropertyValues = (isEmpty, isTypes, properties) => {
    if (isEmpty) {
      return (
        <span className="text-muted small font-italic">
          {i18n("vocabulary.batchEdit.noExistingValues")}
        </span>
      );
    }

    if (isTypes) {
      return (
        <ul className="list-unstyled pl-3 mb-0">
          {properties.map((type, idx) => (
            <li key={idx}>{type as string}</li>
          ))}
        </ul>
      );
    }

    return (
      <TermListPreview
        items={properties as Term[]}
        locale={language}
        expanded={true}
        baseVocabularyIri={vocabularyIri}
      />
    );
  };

  return (
    <>
      <Label className="mb-3">
        {i18n("vocabulary.batchEdit.selectedTerms")}
      </Label>
      <ul className="list-unstyled mb-2">
        {selectedTerms.map((term) => {
          const isExpandable = Boolean(selectedProperty);
          const isExpanded = expandedTermIris.has(term.iri);
          const properties = resolveProperties(
            term,
            selectedProperty,
            language,
            typeOptions
          );
          const isEmpty = properties.length === 0;

          const toggleExpand = () => {
            if (!isExpandable) return;
            setExpandedTermIris((prev) => {
              const next = new Set(prev);
              next.has(term.iri!)
                ? next.delete(term.iri!)
                : next.add(term.iri!);
              return next;
            });
          };

          return (
            <li key={term.iri} className="py-2 border-bottom">
              <div
                role={isExpandable ? "button" : undefined}
                className="d-flex justify-content-between align-items-center"
                onClick={isExpandable ? toggleExpand : undefined}
                style={{ cursor: isExpandable ? "pointer" : "default" }}
              >
                <span className="mb-0">
                  {getLocalizedInLanguage(term.label, language) || term.iri}
                </span>
                {isExpandable && (
                  <span className="text-muted">
                    {isExpanded ? <FaMinus size={14} /> : <FaPlus size={14} />}
                  </span>
                )}
              </div>

              <Collapse isOpen={isExpanded}>
                <div className="mt-2 pt-2 border-top">
                  {renderPropertyValues(
                    isEmpty,
                    selectedProperty === "types",
                    properties
                  )}
                </div>
              </Collapse>
            </li>
          );
        })}
      </ul>
    </>
  );
};
