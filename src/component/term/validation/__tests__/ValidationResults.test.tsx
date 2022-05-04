import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";
import ValidationResults from "../ValidationResults";
import Generator from "../../../../__tests__/environment/Generator";
import ValidationMessage from "../ValidationMessage";
import Term from "../../../../model/Term";
import {
  mockStore,
  mountWithIntl,
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
    const component = mountWithIntl(
      <ValidationResults term={term} {...intlFunctions()} />
    );

    const rows = component.find("div").find(ValidationMessage);
    expect(rows.length).toEqual(2);
  });
});
