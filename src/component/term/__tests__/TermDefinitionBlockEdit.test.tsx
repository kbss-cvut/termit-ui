import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import { TermDefinitionBlockEdit } from "../TermDefinitionBlockEdit";
import { TermData } from "../../../model/Term";
import Constants from "../../../util/Constants";
import { mountWithIntl } from "../../../__tests__/environment/Environment";

jest.mock("../../misc/HelpIcon", () => () => <span>Help</span>);
jest.mock("../../misc/MultilingualIcon", () => () => <span>Multilingual</span>);

describe("TermDefinitionBlockEdit", () => {
  let onChange: (change: Partial<TermData>) => void;

  beforeEach(() => {
    onChange = jest.fn();
  });

  it("merges existing definition value in a different language with edited value", () => {
    const term = Generator.generateTerm();
    const czechValue = "Term definition in Czech";
    const englishValue = "Term definition in English";
    term.definition = { cs: czechValue };
    const wrapper = mountWithIntl(
      <TermDefinitionBlockEdit
        term={term}
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        getValidationResults={jest.fn().mockReturnValue([])}
        {...intlFunctions()}
      />
    );
    const textarea = wrapper.find("textarea");
    (textarea.getDOMNode() as HTMLTextAreaElement).value = englishValue;
    textarea.simulate("change", { currentTarget: { value: englishValue } });
    expect(onChange).toHaveBeenCalled();
    expect((onChange as jest.Mock).mock.calls[0][0]).toEqual({
      definition: { cs: czechValue, en: englishValue },
    });
  });

  it("passes definition value in selected language to definition text textarea", () => {
    const term = Generator.generateTerm();
    term.definition = {
      en: "Building is a kind of construction",
      cs: "Budova je typem stavby",
    };
    const wrapper = mountWithIntl(
      <TermDefinitionBlockEdit
        term={term}
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        getValidationResults={jest.fn().mockReturnValue([])}
        {...intlFunctions()}
      />
    );
    const textarea = wrapper.find("textarea");
    expect(textarea.prop("value")).toEqual(
      term.definition[Constants.DEFAULT_LANGUAGE]
    );
  });
});
