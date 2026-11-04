import VocabulariesReferenceList from "../VocabulariesReferenceList";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router";

vi.mock("../VocabularyIriLink", () => ({
  default: () => <a className="vocabulary-iri-link" />,
}));

describe("VocabulariesReferenceList", () => {
  it("renders links to provided vocabularies", () => {
    mockUseI18n();
    const vocabularies = [
      {
        iri: Generator.generateUri(),
      },
      {
        iri: Generator.generateUri(),
      },
    ];
    const { container } = renderWithIntl(
      <MemoryRouter>
        <VocabulariesReferenceList
          vocabularies={vocabularies}
          labelKey="vocabulary.importedVocabularies"
          htmlId="imported-vocabularies-list"
        />
      </MemoryRouter>
    );
    expect(container.querySelectorAll(".vocabulary-iri-link").length).toEqual(
      2
    );
  });
});
