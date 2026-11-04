import * as React from "react";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Term from "../../../model/Term";
import { CreateTerm } from "../CreateTerm";
import Vocabulary, { EMPTY_VOCABULARY } from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import { createMemoryHistory, Location } from "history";
import { match as Match, MemoryRouter } from "react-router";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import type { Mock } from "vitest";

vi.mock(import("../../../util/Routing"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: vi.fn(),
  } as any;
});
vi.mock("../TermMetadataCreate", () => ({
  default: () => <div className="term-metadata-create" />,
}));

describe("CreateTerm", () => {
  const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
  const iri =
    "http://localhost:8080/termit/rest/vocabularies/test-vocabulary/terms/test-term?namespace=" +
    encodeURI(namespace);

  let onCreate: (term: Term, iri: IRI) => Promise<string>;
  let vocabulary: Vocabulary;
  let term: Term;
  let loadVocabulary: (iri: IRI) => void;

  const normalizedVocabName = "test-vocabulary";

  let location: Location;
  const history = createMemoryHistory();
  let match: Match<any>;

  beforeEach(() => {
    onCreate = vi.fn().mockImplementation(() => Promise.resolve(iri));
    loadVocabulary = vi.fn();
    vocabulary = new Vocabulary({
      iri:
        "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/" +
        normalizedVocabName,
      label: langString("test vocabulary"),
    });
    term = new Term({
      iri: Generator.generateUri(),
      label: langString("test term", Constants.DEFAULT_LANGUAGE),
    });
    location = {
      pathname: `/vocabulary/${normalizedVocabName}/term/create`,
      search: "",
      hash: "",
      state: {},
    };
    match = {
      params: {
        name: normalizedVocabName,
      },
      path: location.pathname,
      isExact: true,
      url: "http://localhost:3000/" + location.pathname,
    };
    Routing.transitionTo = vi.fn();
    Routing.reload = vi.fn();
  });

  function renderCreateTerm(
    props: Partial<React.ComponentProps<typeof CreateTerm>> = {},
    ref: React.RefObject<CreateTerm> = React.createRef()
  ) {
    return renderWithIntl(
      <MemoryRouter>
        <CreateTerm
          ref={ref}
          createTerm={onCreate}
          vocabulary={vocabulary}
          history={history}
          location={location}
          match={match}
          loadVocabulary={loadVocabulary}
          language={Constants.DEFAULT_LANGUAGE}
          {...intlFunctions()}
          {...props}
        />
      </MemoryRouter>
    );
  }

  it("invokes on create on create call", () => {
    const ref = React.createRef<CreateTerm>();
    renderCreateTerm({}, ref);
    ref.current!.onCreate(term, false);
    expect(onCreate).toHaveBeenCalledWith(
      term,
      VocabularyUtils.create(vocabulary.iri)
    );
  });

  it("invokes transition to term detail on successful creation", () => {
    const ref = React.createRef<CreateTerm>();
    renderCreateTerm({}, ref);
    ref.current!.onCreate(term, false);
    return Promise.resolve().then(() => {
      expect(Routing.transitionTo).toHaveBeenCalled();
      const mock = (Routing.transitionTo as Mock).mock;
      const call = mock.calls[mock.calls.length - 1];
      expect(call[0]).toEqual(Routes.vocabularyTermDetail);
      expect((call[1].params as Map<string, string>).get("name")).toEqual(
        "test-vocabulary"
      );
      expect((call[1].params as Map<string, string>).get("termName")).toEqual(
        "test-term"
      );
      expect((call[1].query as Map<string, string>).get("namespace")).toEqual(
        encodeURIComponent(
          "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/"
        )
      );
    });
  });

  it("invokes transition to new term on successful creation", () => {
    const ref = React.createRef<CreateTerm>();
    renderCreateTerm({}, ref);
    ref.current!.onCreate(term, true);
    return Promise.resolve().then(() => {
      expect(Routing.transitionTo).toHaveBeenCalled();
      const mock = (Routing.transitionTo as Mock).mock;
      const call = mock.calls[mock.calls.length - 1];
      expect(call[0]).toEqual(Routes.createVocabularyTerm);
      expect((call[1].params as Map<string, string>).get("name")).toEqual(
        "test-vocabulary"
      );
      expect((call[1].query as Map<string, string>).get("namespace")).toEqual(
        encodeURIComponent(
          "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/"
        )
      );
    });
  });

  it("does not render component while vocabulary is empty", () => {
    const { container, rerender } = renderCreateTerm({
      vocabulary: EMPTY_VOCABULARY,
    });
    expect(
      container.querySelector(".term-metadata-create")
    ).not.toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <CreateTerm
          createTerm={onCreate}
          vocabulary={vocabulary}
          history={history}
          location={location}
          match={match}
          loadVocabulary={loadVocabulary}
          language={Constants.DEFAULT_LANGUAGE}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    expect(
      container.querySelector(".term-metadata-create")
    ).toBeInTheDocument();
  });
});
