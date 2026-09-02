import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { trackPromise } from "react-promise-tracker";
import { Button, FormGroup, Label } from "reactstrap";
import { useI18n } from "../../../hook/useI18n";
import ExactMatchesSelector from "../../../term/ExactMatchesSelector";
import ParentTermSelector from "../../../term/ParentTermSelector";
import { TermSelector } from "../../../term/TermSelector";
import TermTypesEdit from "../../../term/TermTypesEdit";
import Term, { TermInfo } from "../../../../model/Term";
import { TermBatchEditDto } from "../../../../model/TermBatchEditDto";
import Select from "../../../misc/Select";
import { SelectedTermsList } from "./SelectedTermsList";

export interface BatchTermEditorProps {
  vocabularyIri: string;
  language: string;
  selectedTerms: Term[];
  selectedTermIris: Set<string>;
  onSave: (
    updatedProperties: Omit<TermBatchEditDto, "targetTerms">
  ) => Promise<void>;
  onCancel: () => void;
}

export type BatchProperty =
  | "types"
  | "exactMatchTerms"
  | "relatedMatch"
  | "parentTerms"
  | null;

/**
 * A component for editing batch properties of terms in a vocabulary.
 * It allows the user to select a property to edit (types, exact matches,
 * related matches, or parent terms) and provides the appropriate editor for
 * that property.
 *
 * @param vocabularyIri the IRI of the vocabulary being edited.
 * @param language the language for displaying term information.
 * @param selectedTerms the terms to be edited in batch.
 * @param selectedTermIris the IRIs of the terms to be edited in batch.
 * @param onSave a callback function to handle saving the updated properties.
 * @param onCancel a callback function to handle canceling the batch edit.
 */
export const BatchTermEditor: React.FC<BatchTermEditorProps> = ({
  vocabularyIri,
  language,
  selectedTerms,
  selectedTermIris,
  onSave,
  onCancel,
}) => {
  const { i18n } = useI18n();
  const [selectedProperty, setSelectedProperty] = useState<BatchProperty>(null);

  const [localTypes, setLocalTypes] = useState<string[]>([]);
  const [localExactMatches, setLocalExactMatches] = useState<Term[]>([]);
  const [localRelatedMatches, setLocalRelatedMatches] = useState<Term[]>([]);
  const [localParentTerms, setLocalParentTerms] = useState<Term[]>([]);

  const handleSave = () => {
    if (!selectedProperty) return;

    const updatedProperties: Omit<TermBatchEditDto, "targetTerms"> = {};

    if (selectedProperty === "types") {
      updatedProperties.types = localTypes;
    } else if (selectedProperty === "exactMatchTerms") {
      updatedProperties.exactMatchTerms = localExactMatches.map((t) =>
        Term.toTermInfo(t)
      );
    } else if (selectedProperty === "relatedMatch") {
      const sameVocabulary: TermInfo[] = [];
      const differentVocabulary: TermInfo[] = [];

      localRelatedMatches.forEach((v) => {
        if (v.vocabulary?.iri === vocabularyIri) {
          sameVocabulary.push(Term.toTermInfo(v));
        } else {
          differentVocabulary.push(Term.toTermInfo(v));
        }
      });

      if (sameVocabulary.length > 0) {
        updatedProperties.related = sameVocabulary;
      }
      if (differentVocabulary.length > 0) {
        updatedProperties.relatedMatch = differentVocabulary;
      }
    } else if (selectedProperty === "parentTerms") {
      updatedProperties.parentTerms = localParentTerms.map((t) =>
        Term.toTermInfo(t)
      );
    }

    trackPromise(onSave(updatedProperties), "term-cell-editor");
  };

  const renderEditor = () => {
    if (selectedProperty === "types") {
      return (
        <FormGroup className="d-flex flex-column">
          <TermTypesEdit termTypes={localTypes} onChange={setLocalTypes} />
        </FormGroup>
      );
    }

    if (selectedProperty === "exactMatchTerms") {
      return (
        <FormGroup className="d-flex flex-column">
          <ExactMatchesSelector
            id="batch-exact-matches-edit"
            selected={localExactMatches}
            vocabularyIri={vocabularyIri}
            hiddenTermIris={selectedTermIris}
            onChange={(selected) => setLocalExactMatches(selected as Term[])}
          />
        </FormGroup>
      );
    }

    if (selectedProperty === "parentTerms") {
      return (
        <FormGroup className="d-flex flex-column">
          <ParentTermSelector
            id="batch-parent-terms-edit"
            parentTerms={localParentTerms}
            vocabularyIri={vocabularyIri}
            hiddenTermIris={selectedTermIris}
            onChange={(selected) => setLocalParentTerms(selected as Term[])}
          />
        </FormGroup>
      );
    }

    if (selectedProperty === "relatedMatch") {
      const label = (
        <Label className="attribute-label">
          {i18n("term.metadata.related.title")}
        </Label>
      );
      return (
        <FormGroup className="d-flex flex-column">
          <TermSelector
            id="batch-related-terms-edit"
            label={label}
            value={localRelatedMatches}
            vocabularyIri={vocabularyIri}
            fetchedTermsFilter={(terms) =>
              terms.filter((t) => !selectedTermIris.has(t.iri))
            }
            onChange={(selected) => setLocalRelatedMatches(selected as Term[])}
          />
        </FormGroup>
      );
    }

    return null;
  };

  return (
    <div className="term-cell-editor d-flex flex-column h-100">
      <div className="editor-header p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{i18n("vocabulary.batchEdit.title")}</h4>
          <button
            type="button"
            className="close"
            onClick={onCancel}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <Select
          id="batchPropertySelect"
          label={i18n("vocabulary.batchEdit.propertyToEdit")}
          value={selectedProperty || ""}
          onChange={(e: any) => setSelectedProperty(e.target.value)}
        >
          <option value="" disabled>
            {i18n("vocabulary.batchEdit.propertySelect.placeholder")}
          </option>
          <option value="parentTerms">{i18n("term.metadata.parent")}</option>
          <option value="relatedMatch">
            {i18n("term.metadata.related.title")}
          </option>
          <option value="exactMatchTerms">
            {i18n("term.metadata.exactMatches")}
          </option>
          <option value="types">{i18n("term.metadata.types")}</option>
        </Select>
      </div>

      <div className="editor-body p-3 flex-grow-1 overflow-auto">
        {renderEditor()}
        <SelectedTermsList
          selectedTerms={selectedTerms}
          selectedProperty={selectedProperty}
          language={language}
          vocabularyIri={vocabularyIri}
        />
      </div>

      <div className="editor-footer p-3 border-top d-flex justify-content-end">
        <Button color="secondary" size="sm" className="mr-2" onClick={onCancel}>
          <FormattedMessage id="cancel" defaultMessage="Cancel" />
        </Button>
        <Button
          color="primary"
          size="sm"
          onClick={handleSave}
          disabled={!selectedProperty}
        >
          <FormattedMessage id="save" defaultMessage="Save" />
        </Button>
      </div>
    </div>
  );
};
