import Term, { TermData } from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import { langString } from "../../../model/MultilingualString";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { TermOccurrenceData } from "../../../model/TermOccurrence";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import TermDefinitionSource from "../TermDefinitionSource";
import Constants from "../../../util/Constants";

vi.mock("../TermDefinitionSourceLink", () => ({
  default: () => <span className="definition-source-link">Go to source</span>,
}));

describe("TermDefinitionSource", () => {
  const termData: TermData = {
    iri: Generator.generateUri(),
    label: langString("Test"),
    definition: langString("Definition of a term test"),
  };

  function renderSource(term: Term, withDefinitionSource: boolean) {
    return renderWithIntl(
      <TermDefinitionSource
        term={term}
        language={Constants.DEFAULT_LANGUAGE}
        withDefinitionSource={withDefinitionSource}
      />
    );
  }

  // Bug #1562
  it("renders definition source link even when term has no source", () => {
    const definitionSource = generateDefinitionSource();
    const term = new Term(Object.assign({}, termData, { definitionSource }));

    const { container } = renderSource(term, true);
    expect(
      container.querySelector(".definition-source-link")
    ).toBeInTheDocument();
  });
  function generateDefinitionSource(): TermOccurrenceData {
    return {
      iri: Generator.generateUri(),
      target: {
        source: { iri: Generator.generateUri() },
        selectors: [
          {
            iri: Generator.generateUri(),
            exactMatch: "Test",
            types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
          },
        ],
        types: [VocabularyUtils.FILE_OCCURRENCE_TARGET],
      },
      term: termData,
      types: [VocabularyUtils.TERM_DEFINITION_SOURCE],
    };
  }

  it("does not attempt to render definition source link when term has no definition source", () => {
    const term = new Term(termData);

    const { container } = renderSource(term, true);
    expect(
      container.querySelector(".definition-source-link")
    ).not.toBeInTheDocument();
  });

  it("renders definition source link even when term has no definition text", () => {
    let data = Object.assign({}, termData);
    delete data.definition;
    const definitionSource: TermOccurrenceData = generateDefinitionSource();
    const term = new Term(Object.assign({}, termData, { definitionSource }));

    const { container } = renderSource(term, true);
    expect(
      container.querySelector(".definition-source-link")
    ).toBeInTheDocument();
  });

  it("does not render definition source link when configured not to", () => {
    const definitionSource = generateDefinitionSource();
    const term = new Term(
      Object.assign({ sources: ["http://example.org"] }, termData, {
        definitionSource,
      })
    );

    const { container } = renderSource(term, false);
    expect(
      container.querySelector(".definition-source-link")
    ).not.toBeInTheDocument();
  });
});
