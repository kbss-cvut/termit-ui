import {
  default as Vocabulary,
  EMPTY_VOCABULARY,
} from "../../../model/Vocabulary";
import VocabularySelect from "../VocabularySelect";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import { DropdownItem, DropdownToggle } from "reactstrap";
import * as redux from "react-redux";
import { withHooks } from "vitest-react-hooks-shallow";
import { shallow } from "enzyme";
import * as Actions from "../../../action/AsyncActions";
import type {Mock} from "vitest";

vi.mock("react-redux", async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        useSelector: vi.fn(),
        useDispatch: vi.fn(),
    };
});

describe("VocabularySelect", () => {
  let voc: Vocabulary;
  let onVocabularySet: (voc: Vocabulary) => void;
  let vocabularies: { [key: string]: Vocabulary };

  beforeEach(() => {
    onVocabularySet = vi.fn();
    voc = EMPTY_VOCABULARY;
    vocabularies = {};
    vocabularies[EMPTY_VOCABULARY.iri] = EMPTY_VOCABULARY;
  });

  it("loads vocabularies on mount", () => {
    (redux.useSelector as Mock).mockReturnValue({});
    const fakeDispatch = vi.fn();
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
    vi.spyOn(Actions, "loadVocabularies").mockReturnValue(vi.fn());
    withHooks(() => {
      mockUseI18n();
      shallow(
        <VocabularySelect vocabulary={voc} onVocabularySet={onVocabularySet} />
      );
      expect(fakeDispatch).toHaveBeenCalled();
      expect(Actions.loadVocabularies).toHaveBeenCalled();
    });
  });

  it("does not load vocabularies when they are already loaded", () => {
    (redux.useSelector as Mock).mockReturnValue(vocabularies);
    const fakeDispatch = vi.fn();
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
    vi.spyOn(Actions, "loadVocabularies").mockReturnValue(vi.fn());
    withHooks(() => {
      mockUseI18n();
      shallow(
        <VocabularySelect vocabulary={voc} onVocabularySet={onVocabularySet} />
      );
      expect(fakeDispatch).not.toHaveBeenCalled();
    });
  });

  it("VocabularySelect Selection calls the callback", () => {
    (redux.useSelector as Mock).mockReturnValue(vocabularies);
    withHooks(() => {
      mockUseI18n();
      const wrapper = mountWithIntl(
        <VocabularySelect vocabulary={voc} onVocabularySet={onVocabularySet} />
      );
      wrapper.find(DropdownToggle).simulate("click");
      wrapper.find(DropdownItem).simulate("click");
      expect(onVocabularySet).toHaveBeenCalled();
    });
  });
});
