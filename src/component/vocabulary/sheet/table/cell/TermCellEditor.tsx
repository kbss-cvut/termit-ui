import React, { useState } from "react";
import { Button, FormGroup, Label, Input } from "reactstrap";
import Term from "../../../../../model/Term";
import { TermsTableColumn } from "../VocabularySheetViewTableUtils";
import { FormattedMessage } from "react-intl";

import TermTypesEdit from "../../../../term/TermTypesEdit";
import ValueListEdit from "../../../../misc/ValueListEdit";
import { getLocalizedPlural } from "../../../../../model/MultilingualString";
import ExactMatchesSelector from "../../../../term/ExactMatchesSelector";
import ParentTermSelector from "../../../../term/ParentTermSelector";
import RelatedTermsSelector from "../../../../term/RelatedTermsSelector";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../../../../misc/PromiseTrackingMask";

export interface TermCellEditorProps {
  term: Term;
  column: TermsTableColumn;
  language: string;
  onSave: (updatedTerm: Partial<Term>) => Promise<void>;
  onCancel: () => void;
}

type MultilingualColumnConfig = {
  type: "multilingualString";
  termKey: "label" | "definition" | "scopeNote";
  isTextArea?: boolean;
};

type PluralMultilingualColumnConfig = {
  type: "pluralMultilingualString";
  termKey: "examples";
};

type TermArrayColumnConfig = {
  type: "termArray";
  termKey: "exactMatchTerms" | "parentTerms" | "subTerms" | "relatedTerms";
};

type StringArrayColumnConfig = {
  type: "stringArray";
  termKey: "notations";
};

type TermTypesColumnConfig = {
  type: "termTypes";
  termKey: "types";
};

type ColumnConfig =
  | MultilingualColumnConfig
  | PluralMultilingualColumnConfig
  | TermArrayColumnConfig
  | StringArrayColumnConfig
  | TermTypesColumnConfig;

const COLUMN_CONFIG: Record<string, ColumnConfig> = {
  label: { type: "multilingualString", termKey: "label" },
  definition: {
    type: "multilingualString",
    termKey: "definition",
    isTextArea: true,
  },
  scopeNote: {
    type: "multilingualString",
    termKey: "scopeNote",
    isTextArea: true,
  },

  exactMatches: { type: "termArray", termKey: "exactMatchTerms" },
  parentTerms: { type: "termArray", termKey: "parentTerms" },
  subTerms: { type: "termArray", termKey: "subTerms" },
  relatedTerms: { type: "termArray", termKey: "relatedTerms" },

  notation: { type: "stringArray", termKey: "notations" },

  example: { type: "pluralMultilingualString", termKey: "examples" },

  type: { type: "termTypes", termKey: "types" },
};

export const TermCellEditor: React.FC<TermCellEditorProps> = ({
  term,
  column,
  language,
  onSave,
  onCancel,
}) => {
  const config = COLUMN_CONFIG[column.id];

  const [localString, setLocalString] = useState<string>(() => {
    if (config?.type === "multilingualString") {
      const multilingualObj = term[config.termKey] as
        | Record<string, string>
        | undefined;
      return multilingualObj?.[language] || "";
    }
    return "";
  });

  const [localTerms, setLocalTerms] = useState<Term[]>(() => {
    if (config?.type === "termArray") {
      if (config.termKey === "relatedTerms") {
        return Term.consolidateRelatedAndRelatedMatch(term, language) as Term[];
      }
      return (term[config.termKey] as Term[]) || [];
    }
    return [];
  });

  const [localStrings, setLocalStrings] = useState<string[]>(() => {
    if (config?.type === "stringArray") {
      return (term[config.termKey] as string[]) || [];
    }
    return [];
  });

  const [localTypes, setLocalTypes] = useState<string[]>(() => {
    if (config?.type === "termTypes") {
      return (term[config.termKey] as string[]) || [];
    }
    return [];
  });

  const [localExamples, setLocalExamples] = useState<string[]>(() => {
    if (config?.type === "pluralMultilingualString") {
      return getLocalizedPlural(term[config.termKey] as any, language);
    }
    return [];
  });

  const handleSave = () => {
    if (!config) {
      return;
    }

    const updatedProperties: Record<string, any> = {};

    if (config.type === "multilingualString") {
      const existingValues =
        (term[config.termKey] as Record<string, string>) || {};
      updatedProperties[config.termKey] = {
        ...existingValues,
        [language]: localString,
      };
    } else if (config.type === "termArray") {
      if (config.termKey === "parentTerms") {
        updatedProperties[config.termKey] = localTerms;
      } else if (config.termKey === "relatedTerms") {
        const sameVocabulary: any[] = [];
        const differentVocabulary: any[] = [];
        const vocabIri = term.vocabulary?.iri;

        localTerms.forEach((v) => {
          if (v.vocabulary?.iri === vocabIri) {
            sameVocabulary.push(Term.toTermInfo(v));
          } else {
            differentVocabulary.push(Term.toTermInfo(v));
          }
        });
        updatedProperties.relatedTerms = sameVocabulary;
        updatedProperties.relatedMatchTerms = differentVocabulary;
      } else {
        updatedProperties[config.termKey] = localTerms.map((t) =>
          Term.toTermInfo(t)
        );
      }
    } else if (config.type === "stringArray") {
      updatedProperties[config.termKey] = localStrings;
    } else if (config.type === "termTypes") {
      updatedProperties[config.termKey] = localTypes;
    } else if (config.type === "pluralMultilingualString") {
      const existingValues =
        (term[config.termKey] as Record<string, any>) || {};
      updatedProperties[config.termKey] = {
        ...existingValues,
        [language]: localExamples,
      };
    }

    trackPromise(
      onSave(updatedProperties as Partial<Term>),
      "term-cell-editor"
    );
  };

  const renderEditor = () => {
    if (!config) return <p>Cannot edit {column.title} inline yet.</p>;

    if (config.type === "multilingualString") {
      return (
        <FormGroup>
          <Label for="term-property-edit">
            {column.title} ({language})
          </Label>
          <Input
            type={config.isTextArea ? "textarea" : "text"}
            id="term-property-edit"
            value={localString}
            onChange={(e) => setLocalString(e.target.value)}
            rows={config.isTextArea ? 5 : undefined}
          />
        </FormGroup>
      );
    }

    if (config.type === "termArray") {
      if (config.termKey === "exactMatchTerms") {
        return (
          <FormGroup className="d-flex flex-column h-100">
            <ExactMatchesSelector
              id="exact-matches-edit"
              termIri={term.iri!}
              selected={localTerms}
              vocabularyIri={term.vocabulary!.iri!}
              onChange={(selected) => setLocalTerms(selected as Term[])}
            />
          </FormGroup>
        );
      }

      if (config.termKey === "parentTerms") {
        return (
          <FormGroup className="d-flex flex-column h-100">
            <ParentTermSelector
              id="parent-terms-edit"
              termIri={term.iri!}
              parentTerms={localTerms}
              vocabularyIri={term.vocabulary!.iri!}
              onChange={(selected) => setLocalTerms(selected as Term[])}
            />
          </FormGroup>
        );
      }

      if (config.termKey === "relatedTerms") {
        return (
          <FormGroup className="d-flex flex-column h-100">
            <RelatedTermsSelector
              id="related-terms-edit"
              term={term}
              selected={localTerms.map((t) => Term.toTermInfo(t))}
              vocabularyIri={term.vocabulary!.iri!}
              language={language}
              onChange={(selected) => setLocalTerms(selected as Term[])}
              definitionRelatedChanges={{
                pendingApproval: [],
                pendingRemoval: [],
              }}
              onDefinitionRelatedChange={() => {}}
            />
          </FormGroup>
        );
      }
    }

    if (config.type === "stringArray") {
      return (
        <FormGroup className="d-flex flex-column h-100">
          <ValueListEdit
            label={column.title}
            list={localStrings}
            onChange={setLocalStrings}
          />
        </FormGroup>
      );
    }

    if (config.type === "termTypes") {
      return (
        <FormGroup className="d-flex flex-column h-100">
          <TermTypesEdit termTypes={localTypes} onChange={setLocalTypes} />
        </FormGroup>
      );
    }

    if (config.type === "pluralMultilingualString") {
      return (
        <FormGroup className="d-flex flex-column h-100">
          <ValueListEdit
            label={column.title + ` (${language})`}
            list={localExamples}
            onChange={setLocalExamples}
            multilingual={true}
          />
        </FormGroup>
      );
    }

    return null;
  };

  return (
    <div className="term-cell-editor d-flex flex-column h-100">
      <PromiseTrackingMask area="term-cell-editor" />
      <div className="editor-header p-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FormattedMessage
            id="term.edit.property"
            defaultMessage="Edit {property}"
            values={{ property: column.title }}
          />
        </h5>
        <button
          type="button"
          className="close"
          onClick={onCancel}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div className="editor-body p-3 flex-grow-1 overflow-auto">
        {renderEditor()}
      </div>

      <div className="editor-footer p-3 border-top d-flex justify-content-end">
        <Button color="secondary" size="sm" className="mr-2" onClick={onCancel}>
          <FormattedMessage id="cancel" defaultMessage="Cancel" />
        </Button>
        <Button color="primary" size="sm" onClick={handleSave}>
          <FormattedMessage id="save" defaultMessage="Save" />
        </Button>
      </div>
    </div>
  );
};
