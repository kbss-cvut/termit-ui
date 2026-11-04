import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import { TermDefinitionBlockEdit } from "../TermDefinitionBlockEdit";
import { TermData } from "../../../model/Term";
import Constants from "../../../util/Constants";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import type { Mock } from "vitest";

vi.mock("../../misc/HelpIcon", () => ({ default: () => <span>Help</span> }));
vi.mock("../../misc/MultilingualIcon", () => ({
  default: () => <span>Multilingual</span>,
}));

const mocks = vi.hoisted(() => ({ editorProps: {} as any }));
vi.mock("../../misc/MarkdownEditor", () => ({
  default: (props: any) => {
    mocks.editorProps = props;
    return <div>Editor</div>;
  },
}));

describe("TermDefinitionBlockEdit", () => {
  let onChange: (change: Partial<TermData>) => void;

  beforeEach(() => {
    onChange = vi.fn();
  });

  function renderEdit(term: TermData) {
    return renderWithIntl(
      <TermDefinitionBlockEdit
        term={term}
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        getValidationResults={vi.fn().mockReturnValue([])}
        {...intlFunctions()}
      />
    );
  }

  it("merges existing definition value in a different language with edited value", () => {
    const term = Generator.generateTerm();
    const czechValue = "Term definition in Czech";
    const englishValue = "Term definition in English";
    term.definition = { cs: czechValue };
    renderEdit(term);
    mocks.editorProps.onChange(englishValue);
    expect(onChange).toHaveBeenCalled();
    expect((onChange as Mock).mock.calls[0][0]).toEqual({
      definition: { cs: czechValue, en: englishValue },
    });
  });

  it("passes definition value in selected language to definition text editor", () => {
    const term = Generator.generateTerm();
    term.definition = {
      en: "Building is a kind of construction",
      cs: "Budova je typem stavby",
    };
    renderEdit(term);
    expect(mocks.editorProps.value).toEqual(
      term.definition[Constants.DEFAULT_LANGUAGE]
    );
  });
});
