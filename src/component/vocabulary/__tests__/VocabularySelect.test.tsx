import {
  default as Vocabulary,
  EMPTY_VOCABULARY,
} from "../../../model/Vocabulary";
import VocabularySelect from "../VocabularySelect";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import { DropdownItem, DropdownToggle } from "reactstrap";
import * as redux from "react-redux";
import { withHooks } from "jest-react-hooks-shallow";
import { shallow } from "enzyme";
import * as Actions from "../../../action/AsyncActions";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe("VocabularySelect", () => {
  let voc: Vocabulary;
  let onVocabularySet: (voc: Vocabulary) => void;
  let vocabularies: { [key: string]: Vocabulary };

  beforeEach(() => {
    onVocabularySet = jest.fn();
    voc = EMPTY_VOCABULARY;
    vocabularies = {};
    vocabularies[EMPTY_VOCABULARY.iri] = EMPTY_VOCABULARY;
  });

  it("loads vocabularies on mount", () => {
    (redux.useSelector as jest.Mock).mockReturnValue({});
    const fakeDispatch = jest.fn();
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
    jest.spyOn(Actions, "loadVocabularies").mockReturnValue(jest.fn());
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
    (redux.useSelector as jest.Mock).mockReturnValue(vocabularies);
    const fakeDispatch = jest.fn();
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
    jest.spyOn(Actions, "loadVocabularies").mockReturnValue(jest.fn());
    withHooks(() => {
      mockUseI18n();
      shallow(
        <VocabularySelect vocabulary={voc} onVocabularySet={onVocabularySet} />
      );
      expect(fakeDispatch).not.toHaveBeenCalled();
    });
  });

  it("VocabularySelect Selection calls the callback", () => {
    (redux.useSelector as jest.Mock).mockReturnValue(vocabularies);
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
