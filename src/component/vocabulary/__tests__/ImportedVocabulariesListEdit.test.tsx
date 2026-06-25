import Vocabulary from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { shallow } from "enzyme";
import ImportedVocabulariesListEdit from "../ImportedVocabulariesListEdit";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { langString } from "../../../model/MultilingualString";
import * as Redux from "react-redux";
import { ThunkDispatch } from "src/util/Types";
import * as AsyncActions from "../../../action/AsyncActions";
import { loadVocabularies } from "../../../action/AsyncActions";
import { mountWithIntl } from "../../../__tests__/environment/Environment";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe("ImportedVocabulariesListEdit", () => {
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
    vi.spyOn(AsyncActions, "loadVocabularies");
    mockUseI18n();
  });

  it("loads vocabularies after mount when they are not loaded yet", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue({});
    mountWithIntl(
      <ImportedVocabulariesListEdit
        vocabulary={vocabulary}
        onChange={onChange}
      />
    );
    expect(loadVocabularies).toHaveBeenCalled();
  });

  it("renders select without any value when no imported vocabularies are specified", () => {
    const wrapper = shallow(
      <ImportedVocabulariesListEdit
        vocabulary={vocabulary}
        onChange={onChange}
      />
    );
    expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual([]);
  });

  it("calls onChange with selected vocabularies IRIs on vocabulary selection", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(vocabularies);
    const vocabularyArray = Object.keys(vocabularies).map(
      (v) => vocabularies[v]
    );
    const wrapper = shallow(
      <ImportedVocabulariesListEdit
        vocabulary={vocabulary}
        onChange={onChange}
      />
    );
    (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(
      vocabularyArray
    );
    expect(onChange).toHaveBeenCalledWith({
      importedVocabularies: vocabularyArray.map((v) => ({ iri: v.iri })),
    });
  });

  it("calls onChange with empty array when vocabulary selector is reset", () => {
    const selected = Object.keys(vocabularies).map((k) => ({ iri: k }));
    const wrapper = shallow(
      <ImportedVocabulariesListEdit
        vocabulary={vocabulary}
        importedVocabularies={selected}
        onChange={onChange}
      />
    );
    (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)([]);
    expect(onChange).toHaveBeenCalledWith({ importedVocabularies: [] });
  });

  it("does not offer the vocabulary itself for importing", () => {
    const wrapper = shallow(
      <ImportedVocabulariesListEdit
        vocabulary={vocabulary}
        onChange={onChange}
      />
    );
    const options: Vocabulary[] = wrapper
      .find(IntelligentTreeSelect)
      .prop("options");
    expect(options.find((v) => v.iri === vocabulary.iri)).not.toBeDefined();
  });
});
