import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";
import ValidationResults from "../ValidationResults";
import Generator from "../../../../__tests__/environment/Generator";
import Term from "../../../../model/Term";
import {
  mockStore,
  renderWithIntl,
} from "../../../../__tests__/environment/Environment";

describe("Validation Results", () => {
  let term: Term;

  beforeEach(() => {
    term = Generator.generateTerm(Generator.generateUri());
  });

  it("groups results by term and orders them most problematic first", () => {
    const anotherTermIri = "https://example.org/term2";
    mockStore.getState().vocabulary = Generator.generateVocabulary();
    mockStore.getState().vocabulary.iri = term.vocabulary!.iri!;
    mockStore.getState().validationResults[term.vocabulary!.iri!] = {
      [term.iri]: [
        Generator.generateValidationResult(term.iri),
        Generator.generateValidationResult(term.iri),
      ],
      [anotherTermIri]: [Generator.generateValidationResult(anotherTermIri)],
    };
    const { container } = renderWithIntl(
      <ValidationResults term={term} {...intlFunctions()} />
    );

    expect(container.querySelectorAll(".alert").length).toEqual(2);
  });
});
