import TermStatus from "../TermStatus";
import Status from "../../../model/TermStatus";
import Generator from "../../../__tests__/environment/Generator";
import * as redux from "react-redux";
import * as AsyncTermActions from "../../../action/AsyncTermActions";
import { setTermStatus } from "../../../action/AsyncTermActions";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import DraftToggle from "../DraftToggle";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { Badge } from "reactstrap";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock("../DraftToggle", () => () => <span>Toggle</span>);

describe("TermStatus", () => {
  it.each([
    [Status.CONFIRMED, undefined],
    [Status.CONFIRMED, true],
    [Status.DRAFT, false],
  ])(
    "passes correct status to setTermStatus on toggle",
    (expected: Status, draftValue?: boolean) => {
      const vocabulary = Generator.generateVocabulary();
      const user = Generator.generateUser();
      user.types.push(VocabularyUtils.USER_EDITOR);
      (redux.useSelector as jest.Mock).mockReturnValue(user);
      const fakeDispatch = jest.fn().mockResolvedValue({});
      (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
      jest.spyOn(AsyncTermActions, "setTermStatus");
      const term = Generator.generateTerm(vocabulary.iri);
      // @ts-ignore
      term.draft = draftValue;
      const wrapper = mountWithIntl(
        <TermStatus term={term} vocabulary={vocabulary} />
      );
      wrapper.find(DraftToggle).prop("onToggle")();
      expect(setTermStatus).toHaveBeenCalledWith(
        VocabularyUtils.create(term.iri),
        expected
      );
    }
  );

  it("renders non-editable badge when user has no editing authority", () => {
    const vocabulary = Generator.generateVocabulary();
    const user = Generator.generateUser();
    user.types.push(VocabularyUtils.USER_RESTRICTED);
    (redux.useSelector as jest.Mock).mockReturnValue(user);
    const fakeDispatch = jest.fn().mockResolvedValue({});
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
    const term = Generator.generateTerm(vocabulary.iri);
    term.draft = false;
    const wrapper = mountWithIntl(
      <TermStatus term={term} vocabulary={vocabulary} />
    );
    expect(wrapper.exists(DraftToggle)).toBeFalsy();
    expect(wrapper.exists(Badge)).toBeTruthy();
  });
});
