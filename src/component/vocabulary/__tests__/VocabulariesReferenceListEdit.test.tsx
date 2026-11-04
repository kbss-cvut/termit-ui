import Vocabulary from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import VocabulariesReferenceListEdit from "../VocabulariesReferenceListEdit";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import { langString } from "../../../model/MultilingualString";
import * as Redux from "react-redux";
import { ThunkDispatch } from "src/util/Types";
import * as AsyncActions from "../../../action/AsyncActions";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../misc/HelpIcon", () => ({
  default: () => <span>Help</span>,
}));

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

const mocks = vi.hoisted(() => ({ selectProps: {} as any }));
vi.mock("intelligent-tree-select", () => ({
  IntelligentTreeSelect: (props: any) => {
    mocks.selectProps = props;
    return <div data-testid="tree-select" />;
  },
}));

describe("VocabulariesReferenceListEdit", () => {
  let vocabularies: { [key: string]: Vocabulary };
  let vocabulary: Vocabulary;

  let onChange: (change: object) => void;

  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    const vOne = new Vocabulary({
      iri: Generator.generateUri(),
      label: langString("Vocabulary One"),
      types: [VocabularyUtils.VOCABULARY],
    });
    const vTwo = new Vocabulary({
      iri: Generator.generateUri(),
      label: langString("Vocabulary two"),
      types: [VocabularyUtils.VOCABULARY],
    });
    vocabularies = {};
    vocabularies[vOne.iri] = vOne;
    vocabularies[vTwo.iri] = vTwo;
    vocabulary = new Vocabulary({
      iri: Generator.generateUri(),
      label: langString("Edited vocabulary"),
    });
    vocabularies[vocabulary.iri] = vocabulary;
    onChange = vi.fn();
    fakeDispatch = vi.fn();
    vi.spyOn(Redux, "useDispatch").mockReturnValue(fakeDispatch);
    vi.spyOn(AsyncActions, "loadVocabulariesIfNotLoaded").mockReturnValue(
      vi.fn()
    );
    mockUseI18n();
  });

  it("loads vocabularies after mount when they are not loaded yet", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue({});
    renderWithIntl(
      <VocabulariesReferenceListEdit
        vocabulary={vocabulary}
        onChange={onChange}
        fieldKey="importedVocabularies"
        labelKey="vocabulary.importedVocabularies"
        helpKey="vocabulary.importedVocabularies.help"
      />
    );
    expect(AsyncActions.loadVocabulariesIfNotLoaded).toHaveBeenCalled();
    expect(fakeDispatch).toHaveBeenCalled();
  });

  it("renders select without any value when no imported vocabularies are specified", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(vocabularies);
    renderWithIntl(
      <VocabulariesReferenceListEdit
        vocabulary={vocabulary}
        onChange={onChange}
        fieldKey="importedVocabularies"
        labelKey="vocabulary.importedVocabularies"
        helpKey="vocabulary.importedVocabularies.help"
      />
    );
    expect(mocks.selectProps.value).toEqual([]);
  });

  it("calls onChange with selected vocabularies IRIs on vocabulary selection", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(vocabularies);
    const vocabularyArray = Object.keys(vocabularies).map(
      (v) => vocabularies[v]
    );
    renderWithIntl(
      <VocabulariesReferenceListEdit
        vocabulary={vocabulary}
        onChange={onChange}
        fieldKey="importedVocabularies"
        labelKey="vocabulary.importedVocabularies"
        helpKey="vocabulary.importedVocabularies.help"
      />
    );
    (mocks.selectProps.onChange as any)(vocabularyArray);
    expect(onChange).toHaveBeenCalledWith({
      importedVocabularies: vocabularyArray.map((v) => ({ iri: v.iri })),
    });
  });

  it("calls onChange with empty array when vocabulary selector is reset", () => {
    const selected = Object.keys(vocabularies).map((k) => ({ iri: k }));
    vi.spyOn(Redux, "useSelector").mockReturnValue(vocabularies);
    renderWithIntl(
      <VocabulariesReferenceListEdit
        vocabulary={vocabulary}
        selectedVocabularies={selected}
        onChange={onChange}
        fieldKey="importedVocabularies"
        labelKey="vocabulary.importedVocabularies"
        helpKey="vocabulary.importedVocabularies.help"
      />
    );
    (mocks.selectProps.onChange as any)([]);
    expect(onChange).toHaveBeenCalledWith({ importedVocabularies: [] });
  });

  it("does not offer the vocabulary itself for importing", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(vocabularies);
    renderWithIntl(
      <VocabulariesReferenceListEdit
        vocabulary={vocabulary}
        onChange={onChange}
        fieldKey="importedVocabularies"
        labelKey="vocabulary.importedVocabularies"
        helpKey="vocabulary.importedVocabularies.help"
      />
    );
    const options: Vocabulary[] = mocks.selectProps.options;
    expect(options.find((v) => v.iri === vocabulary.iri)).not.toBeDefined();
  });
});
