import React from "react";
import { VocabularyEdit } from "../VocabularyEdit";
import Vocabulary, { CONTEXT } from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Document from "../../../model/Document";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import { fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";
import type { Mock } from "vitest";
import { selectVocabularyLanguages } from "../../../store/StateSelectors";

vi.mock("../../../store/StateSelectors", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../store/StateSelectors")>()),
  selectVocabularyLanguages: vi.fn(),
}));

vi.mock("../../misc/MarkdownEditor", () => ({
  default: () => <div>Editor</div>,
}));

vi.mock("../../misc/HelpIcon", () => ({
  default: () => <span>Help</span>,
}));

vi.mock("../../genericmetadata/UnmappedPropertiesEdit", () => ({
  default: (props: { ignoredProperties?: string[] }) => (
    <div
      className="unmapped-properties-edit"
      data-ignored={JSON.stringify(props.ignoredProperties)}
    />
  ),
}));

describe("VocabularyEdit", () => {
  let onSave: (vocabulary: Vocabulary) => void;
  let onDocumentSave: (document: Document) => void;
  let onCancel: () => void;
  let vocabulary: Vocabulary;

  beforeEach(() => {
    (selectVocabularyLanguages as Mock).mockReturnValue([
      Constants.DEFAULT_LANGUAGE,
    ]);
    onSave = vi.fn();
    onDocumentSave = vi.fn();
    onCancel = vi.fn();
    vocabulary = new Vocabulary({
      primaryLanguage: Constants.DEFAULT_LANGUAGE,
      iri: Generator.generateUri(),
      label: langString("Test vocabulary"),
    });
  });

  function renderEdit(
    ref: React.RefObject<VocabularyEdit> = React.createRef()
  ) {
    return renderWithIntl(
      <MemoryRouter>
        <VocabularyEdit
          ref={ref}
          vocabulary={vocabulary}
          save={onSave}
          saveDocument={onDocumentSave}
          cancel={onCancel}
          language={Constants.DEFAULT_LANGUAGE}
          selectLanguage={vi.fn()}
          publishMessage={vi.fn()}
          customAttributes={[]}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
  }

  it("passes updated vocabulary to onSave", () => {
    const ref = React.createRef<VocabularyEdit>();
    renderEdit(ref);
    const newName = Object.assign({}, ref.current!.state.label);
    newName[Constants.DEFAULT_LANGUAGE] = "Metropolitan plan";
    const newDescription = Object.assign({}, ref.current!.state.label);
    newDescription[Constants.DEFAULT_LANGUAGE] = "Vocabulary description text";
    ref.current!.onChange({ label: newName });
    ref.current!.onChange({ comment: newDescription });
    ref.current!.onSave();
    expect(onSave).toHaveBeenCalled();
    const arg = (onSave as Mock).mock.calls[0][0];
    expect(arg).not.toEqual(vocabulary);
    expect(arg.iri).toEqual(vocabulary.iri);
    expect(arg.label).toEqual(newName);
  });

  it("closes editing view on when clicking on cancel", () => {
    const { container } = renderEdit();
    fireEvent.click(container.querySelector("button#edit-vocabulary-cancel")!);
    expect(onCancel).toHaveBeenCalled();
  });

  it("correctly sets unmapped properties on save", () => {
    const property = Generator.generateUri();
    vocabulary.unmappedProperties = new Map([[property, ["test"]]]);
    const ref = React.createRef<VocabularyEdit>();
    renderEdit(ref);
    const updatedProperties = new Map([[property, ["test1", "test2"]]]);
    act(() => ref.current!.setState({ unmappedProperties: updatedProperties }));
    ref.current!.onSave();
    const result: Vocabulary = (onSave as Mock).mock.calls[0][0];
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

  it("onChange updates component state", () => {
    const ref = React.createRef<VocabularyEdit>();
    renderEdit(ref);
    const importedVocabularies = [{ iri: Generator.generateUri() }];
    ref.current!.onChange({ importedVocabularies });
    expect(ref.current!.state.importedVocabularies).toEqual(
      importedVocabularies
    );
  });

  it("removes translations in specified language when removeTranslation is invoked", () => {
    vocabulary = new Vocabulary({
      iri: Generator.generateUri(),
      label: { en: "Test vocabulary", cs: "Testovací slovník" },
      comment: {
        en: "Test vocabulary comment",
        cs: "Popis testovacího slovník",
      },
    });
    const ref = React.createRef<VocabularyEdit>();
    renderEdit(ref);
    act(() => ref.current!.removeTranslation("cs"));
    expect(ref.current!.state.label).toEqual({ en: vocabulary.label.en });
    expect(ref.current!.state.comment).toEqual({
      en: vocabulary.comment!.en,
    });
  });
});
