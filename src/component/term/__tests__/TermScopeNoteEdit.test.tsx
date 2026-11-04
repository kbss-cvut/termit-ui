import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import { TermData } from "../../../model/Term";
import Constants from "../../../util/Constants";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import TermScopeNoteEdit from "../TermScopeNoteEdit";
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

describe("TermScopeNoteEdit", () => {
  let onChange: (change: Partial<TermData>) => void;

  beforeEach(() => {
    onChange = vi.fn();
  });

  function renderEdit(term: TermData) {
    return renderWithIntl(
      <TermScopeNoteEdit
        term={term}
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        {...intlFunctions()}
      />
    );
  }

  it("merges existing scopeNote value in a different language with edited value", () => {
    const term = Generator.generateTerm();
    const czechValue = "Term scopeNote in Czech";
    const englishValue = "Term scopeNote in English";
    term.scopeNote = { cs: czechValue };
    renderEdit(term);
    mocks.editorProps.onChange(englishValue);
    expect(onChange).toHaveBeenCalled();
    expect((onChange as Mock).mock.calls[0][0]).toEqual({
      scopeNote: { cs: czechValue, en: englishValue },
    });
  });

  it("passes scopeNote value in selected language to scopeNote text textarea", () => {
    const term = Generator.generateTerm();
    term.scopeNote = {
      en: "Building is a kind of construction",
      cs: "Budova je typem stavby",
    };
    renderEdit(term);
    expect(mocks.editorProps.value).toEqual(
      term.scopeNote[Constants.DEFAULT_LANGUAGE]
    );
  });
});
