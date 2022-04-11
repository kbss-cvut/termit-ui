import TermStatus from "../TermStatus";
import Status from "../../../model/TermStatus";
import Generator from "../../../__tests__/environment/Generator";
import * as redux from "react-redux";
import * as AsyncTermActions from "../../../action/AsyncTermActions";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import DraftToggle from "../DraftToggle";
import { setTermStatus } from "../../../action/AsyncTermActions";
import VocabularyUtils from "../../../util/VocabularyUtils";

jest.mock("../DraftToggle", () => () => <span>Toggle</span>);

describe("TermStatus", () => {
  it.each([
    [Status.CONFIRMED, undefined],
    [Status.CONFIRMED, true],
    [Status.DRAFT, false],
  ])(
    "passes correct status to setTermStatus on toggle",
    (expected: Status, draftValue?: boolean) => {
      const fakeDispatch = jest.fn().mockResolvedValue({});
      jest.spyOn(redux, "useDispatch").mockReturnValue(fakeDispatch);
      jest.spyOn(AsyncTermActions, "setTermStatus");
      const term = Generator.generateTerm();
      // @ts-ignore
      term.draft = draftValue;
      const wrapper = mountWithIntl(<TermStatus term={term} />);
      wrapper.find(DraftToggle).prop("onToggle")();
      expect(setTermStatus).toHaveBeenCalledWith(
        VocabularyUtils.create(term.iri),
        expected
      );
    }
  );
});
