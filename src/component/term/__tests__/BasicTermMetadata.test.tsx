import Vocabulary from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import Term, { TermInfo } from "../../../model/Term";
import {
  intlFunctions,
  mockUseI18n,
} from "../../../__tests__/environment/IntlUtil";
import TermLink from "../TermLink";
import BasicTermMetadata from "../BasicTermMetadata";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router";

jest.mock("../TermLink", () => () => <span>Term link</span>);
jest.mock("../../misc/OutgoingLink", () => () => <span>Outgoing link</span>);
jest.mock("../DraftToggle", () => () => <span>Draft toggle</span>);
jest.mock("../TermTypes", () => () => <div>Term types</div>);

describe("BasicTermMetadata", () => {
  const vocabulary: Vocabulary = new Vocabulary({
    iri: Generator.generateUri(),
    label: "Test vocabulary",
  });
  let term: Term;

  beforeEach(() => {
    term = new Term({
      iri: Generator.generateUri(),
      label: langString("Test"),
      scopeNote: langString("test"),
      vocabulary: { iri: vocabulary.iri },
    });
    mockUseI18n();
  });

  it("renders sub terms as term links", () => {
    const subTerms: TermInfo[] = [
      {
        iri: Generator.generateUri(),
        label: langString("SubTerm"),
        vocabulary: { iri: vocabulary.iri },
      },
    ];
    term.subTerms = subTerms;
    const wrapper = mountWithIntl(
      <BasicTermMetadata
        term={term}
        vocabulary={vocabulary}
        language={Constants.DEFAULT_LANGUAGE}
        {...intlFunctions()}
      />
    );
    const subTermLinks = wrapper.find(TermLink);
    expect(subTermLinks.length).toEqual(subTerms.length);
  });

  it("renders parent term link when parent term exists", () => {
    term.parentTerms = [
      new Term({
        iri: Generator.generateUri(),
        label: langString("Parent"),
        vocabulary: { iri: Generator.generateUri() },
      }),
    ];
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <BasicTermMetadata
          term={term}
          vocabulary={vocabulary}
          language={Constants.DEFAULT_LANGUAGE}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    const parentLinks = wrapper.find(TermLink);
    expect(parentLinks.length).toEqual(term.parentTerms.length);
  });

  it("consolidates related and relatedMatch terms and renders them in one list", () => {
    term.relatedTerms = [
      {
        iri: Generator.generateUri(),
        label: langString("related one"),
        vocabulary: { iri: term.vocabulary!.iri },
      },
    ];
    term.relatedMatchTerms = [
      {
        iri: Generator.generateUri(),
        label: langString("related one"),
        vocabulary: { iri: Generator.generateUri() },
      },
    ];

    const wrapper = mountWithIntl(
      <MemoryRouter>
        <BasicTermMetadata
          term={term}
          vocabulary={vocabulary}
          language={Constants.DEFAULT_LANGUAGE}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    const relatedList = wrapper.find("#term-metadata-related");
    expect(relatedList.find(TermLink).length).toEqual(
      term.relatedTerms.length + term.relatedMatchTerms.length
    );
  });
});
