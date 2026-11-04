import * as React from "react";
import Term, { TermData } from "../../../model/Term";
import { Terms } from "../Terms";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { Location } from "history";
import { match as Match, MemoryRouter } from "react-router";
import Routing from "../../../util/Routing";
import Utils from "../../../util/Utils";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import Vocabulary from "../../../model/Vocabulary";
import * as TermTreeSelectHelper from "../TermTreeSelectHelper";
import { langString } from "../../../model/MultilingualString";
import { TermFetchParams } from "../../../util/Types";
import { DEFAULT_CONFIGURATION } from "../../../model/Configuration";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { act } from "react-dom/test-utils";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("../../../util/Routing");
vi.mock("intelligent-tree-select", () => ({
  IntelligentTreeSelect: class extends React.Component {
    render() {
      return <div className="intelligent-tree-select" />;
    }
  },
}));
vi.mock("../TermListToggle", () => ({
  default: () => <div className="term-list-toggle" />,
}));

describe("Terms", () => {
  const vocabularyName = "test-vocabulary";
  const termName = "test-term";
  const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";

  const term: TermData = {
    iri:
      "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/test-vocabulary/terms/" +
      termName,
    label: langString("test term"),
    vocabulary: {
      iri: namespace + vocabularyName,
    },
    types: [VocabularyUtils.TERM],
  };
  let vocabulary: Vocabulary;

  const consumeNotification = vi.fn();
  const selectedTerms: Term | null = null;
  let selectVocabularyTerm: (term: Term | null) => void;
  let fetchTerms: (
    fetchOptions: TermFetchParams<TermData>,
    vocabularyIri: IRI
  ) => Promise<Term[]>;

  let location: Location;
  let match: Match<any>;

  beforeEach(() => {
    vi.resetAllMocks(); // Prevent Routing mock state leaking into subsequent tests
    Utils.calculateAssetListHeight = vi.fn().mockImplementation(() => 100);
    selectVocabularyTerm = vi.fn();
    fetchTerms = vi.fn().mockImplementation(() => Promise.resolve([]));

    location = {
      pathname: "/vocabulary/" + vocabularyName + "/term/",
      search: "",
      hash: "",
      state: {},
    };
    match = {
      params: {
        name: vocabularyName,
      },
      path: location.pathname,
      isExact: true,
      url: "http://localhost:3000/" + location.pathname,
    };
    vocabulary = new Vocabulary({
      iri: namespace + vocabularyName,
      label: langString(vocabularyName),
    });
  });

  describe("onTermSelect", () => {
    it("transitions to selected term detail", () => {
      const ref = React.createRef<Terms>();
      renderTerms({}, ref);
      ref.current!.onTermSelect(new Term(term));
      const call = (Routing.transitionToAsset as Mock).mock.calls[0];
      expect(call[0].iri).toEqual(term.iri);
      expect(call[0].vocabulary).toEqual(term.vocabulary);
      expect(call[0].types).toEqual(term.types);
    });

    // Redmine #1349
    it("does not invoke termSelected when rendered in term detail view and no term is selected (input is cleared)", () => {
      const ref = React.createRef<Terms>();
      renderTerms({ isDetailView: true }, ref);
      ref.current!.onTermSelect(null);
      expect(selectVocabularyTerm).not.toHaveBeenCalled();
    });
  });

  function renderTerms(
    props: Partial<React.ComponentProps<typeof Terms>> = {},
    ref: React.RefObject<Terms> = React.createRef()
  ) {
    return renderWithIntl(
      <MemoryRouter>
        <Terms
          ref={ref}
          selectedTerms={selectedTerms}
          showTermQualityBadge={false}
          notifications={[]}
          consumeNotification={consumeNotification}
          selectVocabularyTerm={selectVocabularyTerm}
          vocabulary={vocabulary}
          fetchTerms={fetchTerms}
          {...intlFunctions()}
          location={location}
          match={match}
          isDetailView={false}
          configuration={DEFAULT_CONFIGURATION}
          terminalStates={[]}
          flatList={false}
          setTermsFlatList={vi.fn()}
          {...props}
        />
      </MemoryRouter>
    );
  }

  it("fetches terms including imported when configured to", () => {
    const ref = React.createRef<Terms>();
    renderTerms({}, ref);
    act(() => ref.current!.setState({ includeImported: true }));
    ref.current!.fetchOptions({});
    expect((fetchTerms as Mock).mock.calls[0][0].includeImported).toBeTruthy();
  });

  it("uses term vocabulary when fetching its subterms", () => {
    const ref = React.createRef<Terms>();
    renderTerms({}, ref);
    act(() => ref.current!.setState({ includeImported: true }));
    const option = new Term({
      iri: Generator.generateUri(),
      label: langString("Test term"),
      vocabulary: { iri: Generator.generateUri() },
    });
    ref.current!.fetchOptions({ optionID: option.iri, option });
    expect((fetchTerms as Mock).mock.calls[0][1]).toEqual(
      VocabularyUtils.create(option.vocabulary!.iri!)
    );
  });

  it("marks the selected term for loading when it changes", () => {
    const ref = React.createRef<Terms>();
    const { rerender } = renderTerms({ isDetailView: true }, ref);
    const resetOptions = vi.fn();
    const resetScrollState = vi.fn();
    (ref.current as any).treeComponent.current = {
      resetOptions,
      resetScrollState,
    };
    act(() => ref.current!.setState({ selectedTermLoaded: true }));

    rerender(
      termsElement({ isDetailView: true, selectedTerms: new Term(term) }, ref)
    );

    expect(ref.current!.state.selectedTermLoaded).toBeFalsy();
    expect(resetOptions).toHaveBeenCalled();
  });

  function termsElement(
    props: Partial<React.ComponentProps<typeof Terms>> = {},
    ref?: React.RefObject<Terms>
  ) {
    return (
      <MemoryRouter>
        <Terms
          ref={ref}
          selectedTerms={selectedTerms}
          showTermQualityBadge={false}
          notifications={[]}
          consumeNotification={consumeNotification}
          selectVocabularyTerm={selectVocabularyTerm}
          vocabulary={vocabulary}
          fetchTerms={fetchTerms}
          {...intlFunctions()}
          location={location}
          match={match}
          isDetailView={false}
          configuration={DEFAULT_CONFIGURATION}
          terminalStates={[]}
          flatList={false}
          setTermsFlatList={vi.fn()}
          {...props}
        />
      </MemoryRouter>
    );
  }

  it("disables include imported terms toggle when fetching terms", () => {
    const ref = React.createRef<Terms>();
    const { rerender } = renderTerms({}, ref);
    expect(ref.current!.state.disableIncludeImportedToggle).toBeFalsy();
    fetchTerms = vi.fn().mockImplementation(() => {
      expect(ref.current!.state.disableIncludeImportedToggle).toBeTruthy();
      return Promise.resolve([]);
    });
    rerender(termsElement({ fetchTerms }, ref));
    return ref.current!.fetchOptions({}).then(() => {
      expect(fetchTerms).toHaveBeenCalled();
      expect(ref.current!.state.disableIncludeImportedToggle).toBeFalsy();
    });
  });

  describe("fetchOptions", () => {
    it("filters out terms which are not in the vocabulary import chain", () => {
      const vocabularies = [
        Generator.generateUri(),
        Generator.generateUri(),
        Generator.generateUri(),
      ];
      vocabulary.allImportedVocabularies = vocabularies;
      const terms: Term[] = [];
      const matching: Term[] = [];
      for (let i = 0; i < 5; i++) {
        const termMatches = Generator.randomBoolean();
        const t = Generator.generateTerm(
          termMatches
            ? Generator.randomItem(vocabularies)
            : Generator.generateUri()
        );
        terms.push(t);
        if (termMatches) {
          matching.push(t);
        }
      }
      fetchTerms = vi.fn().mockResolvedValue(terms);
      const ref = React.createRef<Terms>();
      renderTerms({}, ref);
      act(() => ref.current!.setState({ includeImported: true }));
      return ref.current!.fetchOptions({}).then((options) => {
        expect(options).toEqual(matching);
      });
    });

    it("filters out terms from different vocabularies when vocabulary has no imports", () => {
      const terms: Term[] = [];
      const matching: Term[] = [];
      for (let i = 0; i < 5; i++) {
        const termMatches = Generator.randomBoolean();
        const t = Generator.generateTerm(
          termMatches ? vocabulary.iri : Generator.generateUri()
        );
        terms.push(t);
        if (termMatches) {
          matching.push(t);
        }
      }
      fetchTerms = vi.fn().mockResolvedValue(terms);
      const ref = React.createRef<Terms>();
      renderTerms({}, ref);
      return ref.current!.fetchOptions({}).then((options) => {
        expect(options).toEqual(matching);
      });
    });

    it("filters out term's children which are in vocabularies outside of the vocabulary import chain", () => {
      const terms: Term[] = [Generator.generateTerm(vocabulary.iri)];
      const subTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("child one"),
          vocabulary: { iri: vocabulary.iri },
        },
        {
          iri: Generator.generateUri(),
          label: langString("child two"),
          vocabulary: { iri: Generator.generateUri() },
        },
      ];
      terms[0].subTerms = subTerms;
      terms[0].syncPlainSubTerms();
      fetchTerms = vi.fn().mockResolvedValue(terms);
      const ref = React.createRef<Terms>();
      renderTerms({}, ref);
      return ref.current!.fetchOptions({}).then((options) => {
        expect(options.length).toEqual(1);
        const t = options[0];
        expect(t.subTerms!.length).toEqual(1);
        expect(t.subTerms![0].iri).toEqual(subTerms[0].iri);
        expect(t.plainSubTerms).toEqual([subTerms[0].iri]);
      });
    });

    it("flattens loaded terms when search string was provided", () => {
      const child = Generator.generateTerm(vocabulary.iri);
      const parent = Generator.generateTerm(vocabulary.iri);
      const grandParent = Generator.generateTerm(vocabulary.iri);
      child.parentTerms = [parent];
      parent.subTerms = [{ iri: child.iri, label: child.label, vocabulary }];
      parent.parentTerms = [grandParent];
      grandParent.subTerms = [
        { iri: parent.iri, label: parent.label, vocabulary },
      ];
      parent.syncPlainSubTerms();
      grandParent.syncPlainSubTerms();
      fetchTerms = vi.fn().mockResolvedValue([child]);
      const ref = React.createRef<Terms>();
      renderTerms({}, ref);
      return ref
        .current!.fetchOptions({ searchString: "test" })
        .then((options) => {
          expect(options.length).toEqual(3);
          expect(options.find((t) => t.iri === child.iri)).toBeDefined();
          expect(options.find((t) => t.iri === parent.iri)).toBeDefined();
          expect(options.find((t) => t.iri === grandParent.iri)).toBeDefined();
        });
    });

    it("excludes imported vocabularies when processing loaded terms when includeImported is set to false", () => {
      const terms = [Generator.generateTerm(vocabulary.iri)];
      const parent = Generator.generateTerm(Generator.generateUri());
      vocabulary.allImportedVocabularies = [parent.vocabulary!.iri!];
      terms[0].parentTerms = [parent];
      fetchTerms = vi.fn().mockResolvedValue(terms);
      const spy = vi.spyOn(TermTreeSelectHelper, "processTermsForTreeSelect");
      const ref = React.createRef<Terms>();
      renderTerms({}, ref);
      return ref
        .current!.fetchOptions({ searchString: "test" })
        .then((options) => {
          expect(options.length).toEqual(1);
          expect(options).toEqual(terms);
          expect(spy).toHaveBeenCalledWith(
            terms,
            [expect.any(Function), expect.any(Function)],
            expect.objectContaining({
              searchString: "test",
            })
          );
        });
    });
  });
});
