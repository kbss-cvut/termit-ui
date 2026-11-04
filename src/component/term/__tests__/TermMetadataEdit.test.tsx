import * as React from "react";
import Term, { CONTEXT, TermInfo } from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import { TermMetadataEdit } from "../TermMetadataEdit";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Ajax from "../../../util/Ajax";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {
  getLocalized,
  langString,
  pluralLangString,
} from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import { ConsolidatedResults } from "../../../model/ConsolidatedResults";
import { DefinitionRelatedChanges } from "../DefinitionRelatedTermsEdit";
import Vocabulary from "../../../model/Vocabulary";
import { MemoryRouter } from "react-router";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import type { Mock } from "vitest";

vi.mock("../ParentTermSelector", () => ({
  default: () => <div>Parent selector</div>,
}));
vi.mock("../ExactMatchesSelector", () => ({
  default: () => <div>Exact match selector</div>,
}));
vi.mock("../RelatedTermsSelector", () => ({
  default: () => <div>Related terms selector</div>,
}));
vi.mock("../TermTypesEdit", () => ({
  default: () => <div>Term types edit</div>,
}));
vi.mock("../../misc/AssetLabel", () => ({
  default: () => <span>AssetLabel</span>,
}));
vi.mock("../../misc/ValueListEdit", () => ({
  default: (props: { list?: string[] }) => (
    <div className="string-list-edit" data-list={JSON.stringify(props.list)} />
  ),
}));
vi.mock("../../misc/MarkdownEditor", () => ({
  default: () => <div className="markdown-editor" />,
}));
vi.mock("../../genericmetadata/UnmappedPropertiesEdit", () => ({
  default: (props: { ignoredProperties?: string[] }) => (
    <div
      className="unmapped-properties-edit"
      data-ignored={JSON.stringify(props.ignoredProperties)}
    />
  ),
}));

describe("Term edit", () => {
  let term: Term;
  let vocabulary: Vocabulary;
  let onSave: (
    t: Term,
    definitionRelatedChanges: DefinitionRelatedChanges
  ) => void;
  let onCancel: () => void;
  let selectLanguage: (lang: string) => void;
  let validationResults: ConsolidatedResults;

  beforeEach(() => {
    vocabulary = Generator.generateVocabulary();
    term = new Term({
      iri: Generator.generateUri(),
      label: langString("Test"),
      scopeNote: langString("test"),
      vocabulary: { iri: vocabulary.iri },
    });
    validationResults = {};
    onSave = vi.fn();
    onCancel = vi.fn();
    selectLanguage = vi.fn();
    Ajax.head = vi.fn().mockResolvedValue({});
  });

  function renderEdit(
    props: Partial<React.ComponentProps<typeof TermMetadataEdit>> = {},
    ref: React.RefObject<TermMetadataEdit> = React.createRef()
  ) {
    return renderWithIntl(
      <MemoryRouter>
        <TermMetadataEdit
          ref={ref}
          save={onSave}
          term={term}
          cancel={onCancel}
          language={Constants.DEFAULT_LANGUAGE}
          selectLanguage={selectLanguage}
          validationResults={validationResults}
          publishMessage={vi.fn()}
          vocabularyPrimaryLanguage={Constants.DEFAULT_LANGUAGE}
          {...intlFunctions()}
          {...props}
        />
      </MemoryRouter>
    );
  }

  function labelInput(container: HTMLElement) {
    return container.querySelector(
      'input[name="edit-term-label"]'
    ) as HTMLInputElement;
  }

  function saveButton(container: HTMLElement) {
    return container.querySelector("#edit-term-submit") as HTMLButtonElement;
  }

  it("disables save button when label field is empty", () => {
    const { container } = renderEdit();
    return Promise.resolve().then(() => {
      fireEvent.change(labelInput(container), {
        target: { name: "edit-term-label", value: "" },
      });
      expect(saveButton(container).disabled).toBeTruthy();
    });
  });

  it("invokes save with state data when save is clicked", () => {
    const { container } = renderEdit();
    // mock answer to duplicated label check: 404 meaning label does not exist and so is unique
    Ajax.head = vi.fn().mockRejectedValue({ status: 404 });
    const newLabel = "New label";
    fireEvent.change(labelInput(container), {
      target: { name: "edit-term-label", value: newLabel },
    });
    return Promise.resolve().then(() => {
      fireEvent.click(saveButton(container));
      expect(onSave).toHaveBeenCalled();
      const arg = (onSave as Mock).mock.calls[0][0];
      expect(arg.iri).toEqual(term.iri);
      expect(arg.label).toEqual(langString(newLabel));
      expect(arg.scopeNote).toEqual(term.scopeNote);
    });
  });

  it("checks for label uniqueness in vocabulary on label change", () => {
    const { container } = renderEdit();
    const newLabel = "New label";
    fireEvent.change(labelInput(container), {
      target: { name: "edit-term-label", value: newLabel },
    });
    return Promise.resolve().then(() => {
      expect(Ajax.head).toHaveBeenCalled();
      expect(
        (Ajax.head as Mock).mock.calls[0][1].getParams().prefLabel
      ).toEqual(newLabel);
    });
  });

  it("does not check for label uniqueness when new label is the same as original", () => {
    const { container } = renderEdit();
    fireEvent.change(labelInput(container), {
      target: { name: "edit-term-label", value: getLocalized(term.label) },
    });
    expect(Ajax.head).not.toHaveBeenCalled();
  });

  it("merges existing label value in a different language with edited value", () => {
    const czechValue = "Test in Czech";
    const englishValue = "Test in English";
    term.label.cs = czechValue;
    const ref = React.createRef<TermMetadataEdit>();
    const { container } = renderEdit({ language: "en" }, ref);
    fireEvent.change(labelInput(container), {
      target: { name: "edit-term-label", value: englishValue },
    });
    expect(ref.current!.state.label).toEqual({
      cs: czechValue,
      en: englishValue,
    });
  });

  /**
   * Bug 1323
   */
  it("does not check for label uniqueness when new label differs only in case from original", () => {
    const { container } = renderEdit();
    fireEvent.change(labelInput(container), {
      target: {
        name: "edit-term-label",
        value: getLocalized(term.label).toUpperCase(),
      },
    });
    expect(Ajax.head).not.toHaveBeenCalled();
  });

  it("disables save button when duplicate label is set", () => {
    const { container } = renderEdit();
    Ajax.head = vi.fn().mockResolvedValue({ status: 200 });
    fireEvent.change(labelInput(container), {
      target: { name: "edit-term-label", value: "New label" },
    });
    return Promise.resolve().then(() => {
      expect(saveButton(container).disabled).toBeTruthy();
    });
  });

  it("correctly sets unmapped properties on save", () => {
    const property = Generator.generateUri();
    term.unmappedProperties = new Map([[property, ["test"]]]);
    const ref = React.createRef<TermMetadataEdit>();
    renderEdit({}, ref);
    const updatedProperties = new Map([[property, ["test1", "test2"]]]);
    act(() => ref.current!.setState({ unmappedProperties: updatedProperties }));
    ref.current!.onSave();
    const result: Term = (onSave as Mock).mock.calls[0][0];
    expect(result.unmappedProperties).toEqual(updatedProperties);
    expect(result[property]).toBeDefined();
    expect(result[property]).toEqual(updatedProperties.get(property));
  });

  it("passes mapped Term properties for ignoring to UnmappedPropertiesEdit", () => {
    const { container } = renderEdit();
    const ignored: string[] = JSON.parse(
      container
        .querySelector(".unmapped-properties-edit")!
        .getAttribute("data-ignored")!
    );
    expect(ignored).toBeDefined();
    expect(ignored.indexOf(VocabularyUtils.RDF_TYPE)).not.toEqual(-1);
    Object.getOwnPropertyNames((n: string) =>
      expect(ignored[CONTEXT[n]]).not.toEqual(-1)
    );
  });

  it("passes label value in selected language to label edit input", () => {
    term.label = { en: "Building", cs: "Budova" };
    const { container } = renderEdit({ language: "en" });
    expect(labelInput(container).value).toEqual(term.label.en);
  });

  it("passes altLabel and hiddenLabel values in selected language to string list edit", () => {
    term.altLabels = {
      en: ["building", "construction"],
      cs: ["budova", "stavba"],
    };
    term.hiddenLabels = { en: ["shack"], cs: ["barák", "dům"] };
    const { container } = renderEdit({ language: "cs" });
    const stringListEdits = container.querySelectorAll(".string-list-edit");
    expect(JSON.parse(stringListEdits[0].getAttribute("data-list")!)).toEqual(
      term.altLabels.cs
    );
    expect(JSON.parse(stringListEdits[1].getAttribute("data-list")!)).toEqual(
      term.hiddenLabels.cs
    );
  });

  it("maps list of string alt labels to multilingual strings with selected language", () => {
    const ref = React.createRef<TermMetadataEdit>();
    renderEdit({ language: "cs" }, ref);
    const list = ["budova", "stavba"];
    ref.current!.onAltLabelsChange(list);
    expect(ref.current!.state.altLabels).toEqual(pluralLangString(list, "cs"));
  });

  it("maps list of string hidden labels to multilingual strings with selected language", () => {
    const ref = React.createRef<TermMetadataEdit>();
    renderEdit({ language: "de" }, ref);
    const list = ["bau", "gebäude"];
    ref.current!.onHiddenLabelsChange(list);
    expect(ref.current!.state.hiddenLabels).toEqual(
      pluralLangString(list, "de")
    );
  });

  describe("removeTranslation", () => {
    it("removes translation from cloned state term data", () => {
      const langToRemove = "cs";
      term.label[langToRemove] = "český preklad";
      const ref = React.createRef<TermMetadataEdit>();
      renderEdit({ language: "en" }, ref);
      const originalState = ref.current!.state;
      act(() => ref.current!.removeTranslation(langToRemove));
      expect(ref.current!.state.label[langToRemove]).not.toBeDefined();
      // Original state should be unharmed
      expect(originalState.label[langToRemove]).toBeDefined();
    });

    it("handles removal of translation in server configured language", () => {
      const langToRemove = "cs";
      term.label = langString("český preklad", "cs");
      const ref = React.createRef<TermMetadataEdit>();
      renderEdit({ language: "en" }, ref);
      act(() => ref.current!.removeTranslation(langToRemove));
      expect(ref.current!.state.label[langToRemove]).not.toBeDefined();
    });
  });

  describe("onRelatedChange", () => {
    it("distributes provided value into related and relatedMatch attributes based on their membership in the current term's vocabulary", () => {
      const related = [Generator.generateTerm(term.vocabulary!.iri)];
      const relatedMatch = [Generator.generateTerm(Generator.generateUri())];
      const ref = React.createRef<TermMetadataEdit>();
      renderEdit({ language: "en" }, ref);
      ref.current!.onRelatedChange([...related, ...relatedMatch]);
      expect(ref.current!.state.relatedTerms).toEqual(
        related.map((t) => Term.toTermInfo(t))
      );
      expect(ref.current!.state.relatedMatchTerms).toEqual(
        relatedMatch.map((t) => Term.toTermInfo(t))
      );
    });
  });

  describe("onExactMatchesChange", () => {
    it("transforms provided Term instances to TermInfo to prevent issues with circular references serialization", () => {
      const change = [Generator.generateTerm()];
      change[0].parentTerms = [Generator.generateTerm()];
      change[0].parentTerms[0].subTerms = [change[0] as TermInfo];
      const ref = React.createRef<TermMetadataEdit>();
      renderEdit({ language: "en" }, ref);
      ref.current!.onExactMatchesChange(change);
      ref.current!.state.exactMatchTerms!.forEach((et) =>
        expect(et).toEqual(
          expect.not.objectContaining({ parentTerms: expect.any(Array) })
        )
      );
    });
  });
});
