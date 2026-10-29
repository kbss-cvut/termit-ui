import Term, { TermData } from "../../../../model/Term";
import VocabularyUtils, { IRI } from "../../../../util/VocabularyUtils";
import Vocabulary from "../../../../model/Vocabulary";
import { Location } from "history";
import { match as Match } from "react-router";
import Utils from "../../../../util/Utils";
import Routing from "../../../../util/Routing";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";
import Generator from "../../../../__tests__/environment/Generator";
import * as TermTreeSelectHelper from "../../../term/TermTreeSelectHelper";
import { langString } from "../../../../model/MultilingualString";
import {
  TermFetchParams,
  TreeSelectFetchOptionsParams,
} from "../../../../util/Types";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { Terms } from "../Terms";

vi.mock("intelligent-tree-select", async () => {
  const React = await import("react");
  return {
    IntelligentTreeSelect: React.forwardRef(
      (
        props: {
          fetchOptions: (
            params: TreeSelectFetchOptionsParams<Term>
          ) => Promise<Term[]>;
          onChange: (term: Term) => void;
        },
        ref
      ) => {
        const [parameters, setParameters] = React.useState("{}");
        const [options, setOptions] = React.useState<Term[]>([]);
        const load = () =>
          props.fetchOptions(JSON.parse(parameters)).then((loaded) => {
            setOptions(loaded);
            optionsLoaded(loaded);
          });
        React.useImperativeHandle(ref, () => ({
          resetOptions: () => undefined,
        }));
        return (
          <>
            <input
              aria-label="Fetch parameters"
              value={parameters}
              onChange={(event) => setParameters(event.target.value)}
            />
            <button onClick={load}>Load terms</button>
            {options.map((option) => (
              <button key={option.iri} onClick={() => props.onChange(option)}>
                {option.iri}
              </button>
            ))}
          </>
        );
      }
    ),
  };
});
vi.mock("../../../term/TermListToggle", () => ({
  default: ({
    value,
    disabled,
    onToggle,
  }: {
    value: boolean;
    disabled: boolean;
    onToggle: () => void;
  }) => (
    <button
      aria-label="Include imported terms"
      aria-pressed={value}
      disabled={disabled}
      onClick={onToggle}
    >
      Include imported terms
    </button>
  ),
}));

vi.mock("../../../../util/Routing");

const { optionsLoaded } = vi.hoisted(() => ({ optionsLoaded: vi.fn() }));

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

  const selectedTerms: Term | null = null;
  let selectVocabularyTerm: (term: Term | null) => void;
  let fetchTerms: (
    fetchOptions: TermFetchParams<any>,
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

  function renderTerms() {
    return renderWithIntl(
      <Terms
        selectedTerms={selectedTerms}
        selectVocabularyTerm={selectVocabularyTerm}
        vocabulary={vocabulary}
        fetchTerms={fetchTerms}
        terminalStates={[]}
        {...intlFunctions()}
        location={location}
        match={match}
      />
    );
  }

  async function loadOptions(
    params: TreeSelectFetchOptionsParams<Term> = {}
  ): Promise<Term[]> {
    optionsLoaded.mockClear();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Fetch parameters" }),
      {
        target: { value: JSON.stringify(params) },
      }
    );
    fireEvent.click(screen.getByRole("button", { name: "Load terms" }));
    await waitFor(() => expect(optionsLoaded).toHaveBeenCalledTimes(1));
    return optionsLoaded.mock.calls[0][0];
  }

  it("transitions to term detail on term select", async () => {
    fetchTerms = vi.fn().mockResolvedValue([new Term(term)]);
    renderTerms();
    await loadOptions();
    fireEvent.click(screen.getByRole("button", { name: term.iri }));
    const call = (Routing.transitionToPublicAsset as Mock).mock.calls[0];
    expect(call[0].iri).toEqual(term.iri);
    expect(call[0].vocabulary).toEqual(term.vocabulary);
    expect(call[0].types).toEqual(term.types);
  });

  it("transitions to selected term detail", async () => {
    fetchTerms = vi.fn().mockResolvedValue([new Term(term)]);
    renderTerms();
    await loadOptions();
    fireEvent.click(screen.getByRole("button", { name: term.iri }));
    const call = (Routing.transitionToPublicAsset as Mock).mock.calls[0];
    expect(call[0].iri).toEqual(term.iri);
    expect(call[0].vocabulary).toEqual(term.vocabulary);
    expect(call[0].types).toEqual(term.types);
  });

  it("fetches terms including imported when configured to", async () => {
    location.search = "?includeImported=true";
    renderTerms();
    await loadOptions();
    expect((fetchTerms as Mock).mock.calls[0][0].includeImported).toBeTruthy();
  });

  it("uses term vocabulary when fetching its subterms", async () => {
    location.search = "?includeImported=true";
    renderTerms();
    const option = new Term({
      iri: Generator.generateUri(),
      label: langString("Test term"),
      vocabulary: { iri: Generator.generateUri() },
    });
    await loadOptions({ optionID: option.iri, option });
    expect((fetchTerms as Mock).mock.calls[0][1]).toEqual(
      VocabularyUtils.create(option.vocabulary!.iri!)
    );
  });

  it("disables include imported terms toggle when fetching terms", async () => {
    vocabulary.importedVocabularies = [];
    let resolveFetch!: (terms: Term[]) => void;
    fetchTerms = vi.fn().mockReturnValue(
      new Promise<Term[]>((resolve) => {
        resolveFetch = resolve;
      })
    );
    renderTerms();
    const toggle = screen.getByRole("button", {
      name: "Include imported terms",
    });
    expect(toggle).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Load terms" }));
    expect(toggle).toBeDisabled();
    await act(async () => {
      resolveFetch([]);
    });
    expect(fetchTerms).toHaveBeenCalled();
    expect(toggle).toBeEnabled();
  });

  describe("fetchOptions", () => {
    it("filters out terms which are not in the vocabulary import chain", async () => {
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
      location.search = "?includeImported=true";
      renderTerms();
      expect(await loadOptions()).toEqual(matching);
    });

    it("filters out terms from different vocabularies when vocabulary has no imports", async () => {
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
      renderTerms();
      expect(await loadOptions()).toEqual(matching);
    });

    it("filters out term's children which are in vocabularies outside of the vocabulary import chain", async () => {
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
      renderTerms();
      const options = await loadOptions();
      expect(options.length).toEqual(1);
      const t = options[0];
      expect(t.subTerms!.length).toEqual(1);
      expect(t.subTerms![0].iri).toEqual(subTerms[0].iri);
      expect(t.plainSubTerms).toEqual([subTerms[0].iri]);
    });

    it("flattens loaded terms when search string was provided", async () => {
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
      renderTerms();
      const options = await loadOptions({ searchString: "test" });
      expect(options.length).toEqual(3);
      expect(options.find((t) => t.iri === child.iri)).toBeDefined();
      expect(options.find((t) => t.iri === parent.iri)).toBeDefined();
      expect(options.find((t) => t.iri === grandParent.iri)).toBeDefined();
    });

    it("excludes imported vocabularies when processing loaded terms when includeImported is set to false", async () => {
      const terms = [Generator.generateTerm(vocabulary.iri)];
      const parent = Generator.generateTerm(Generator.generateUri());
      vocabulary.allImportedVocabularies = [parent.vocabulary!.iri!];
      terms[0].parentTerms = [parent];
      fetchTerms = vi.fn().mockResolvedValue(terms);
      const spy = vi.spyOn(TermTreeSelectHelper, "processTermsForTreeSelect");
      renderTerms();
      const options = await loadOptions({ searchString: "test" });
      expect(options.length).toEqual(1);
      expect(options).toEqual(terms);
      expect(spy).toHaveBeenCalledWith(
        terms,
        [expect.any(Function), expect.any(Function)],
        expect.objectContaining({ searchString: "test" })
      );
    });
  });
});
