import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import { TermData } from "../../../model/Term";
import Constants from "../../../util/Constants";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import TermScopeNoteEdit from "../TermScopeNoteEdit";

jest.mock("../../misc/HelpIcon", () => () => <span>Help</span>);
jest.mock("../../misc/MultilingualIcon", () => () => <span>Multilingual</span>);

describe("TermScopeNoteEdit", () => {
  let onChange: (change: Partial<TermData>) => void;

  beforeEach(() => {
    onChange = jest.fn();
  });

  it("merges existing scopeNote value in a different language with edited value", () => {
    const term = Generator.generateTerm();
    const czechValue = "Term scopeNote in Czech";
    const englishValue = "Term scopeNote in English";
    term.scopeNote = { cs: czechValue };
    const wrapper = mountWithIntl(
      <TermScopeNoteEdit
        term={term}
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        {...intlFunctions()}
      />
    );
    const textarea = wrapper.find("textarea");
    (textarea.getDOMNode() as HTMLTextAreaElement).value = englishValue;
    textarea.simulate("change", { currentTarget: { value: englishValue } });
    expect(onChange).toHaveBeenCalled();
    expect((onChange as jest.Mock).mock.calls[0][0]).toEqual({
      scopeNote: { cs: czechValue, en: englishValue },
    });
  });

  it("passes scopeNote value in selected language to scopeNote text textarea", () => {
    const term = Generator.generateTerm();
    term.scopeNote = {
      en: "Building is a kind of construction",
      cs: "Budova je typem stavby",
    };
    const wrapper = mountWithIntl(
      <TermScopeNoteEdit
        term={term}
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        {...intlFunctions()}
      />
    );
    const textarea = wrapper.find("textarea");
    expect(textarea.prop("value")).toEqual(
      term.scopeNote[Constants.DEFAULT_LANGUAGE]
    );
  });
});
