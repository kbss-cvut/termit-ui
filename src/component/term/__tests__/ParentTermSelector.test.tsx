import * as React from "react";
import {
  ParentTermSelector,
  ParentTermSelectorProps,
} from "../ParentTermSelector";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Term, { TermData } from "../../../model/Term";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Vocabulary from "../../../model/Vocabulary";
import { langString } from "../../../model/MultilingualString";
import { TermFetchParams } from "../../../util/Types";
import noop from "lodash/noop";
import { MemoryRouter } from "react-router";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { act } from "react";
import type { Mock } from "vitest";

vi.mock("intelligent-tree-select", () => ({
  IntelligentTreeSelect: class extends React.Component<{
    value?: string[];
  }> {
    render() {
      return (
        <div
          data-testid="tree-select"
          data-value={JSON.stringify(this.props.value)}
        />
      );
    }
  },
}));
vi.mock("../TermListToggle", () => ({
  default: () => <div className="term-list-toggle" />,
}));

describe("ParentTermSelector", () => {
  const vocabularyIri = Generator.generateUri();

  let onChange: (parents: Term[]) => void;
  let loadTerms: (
    fetchOptions: TermFetchParams<TermData>,
    vocabularyIri: IRI
  ) => Promise<Term[]>;
  let loadImports: (vocabularyIri: IRI) => Promise<string[]>;

  beforeEach(() => {
    onChange = vi.fn();
    loadTerms = vi.fn().mockResolvedValue([]);
    loadImports = vi.fn().mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes selected parent as value to tree component", () => {
    const vocabulary = new Vocabulary({
      iri: vocabularyIri,
      label: langString("Test vocabulary"),
    });
    vocabulary.allImportedVocabularies = [];
    const parentTerms = [Generator.generateTerm(vocabularyIri)];
    const { container } = renderSelector({
      termIri: Generator.generateUri(),
      vocabularyIri,
      currentVocabulary: vocabulary,
      parentTerms,
    });
    expect(treeSelectValue(container)).toEqual([parentTerms[0].iri]);
  });

  function treeSelectValue(container: HTMLElement) {
    return JSON.parse(
      container
        .querySelector("[data-testid='tree-select']")!
        .getAttribute("data-value")!
    );
  }

  function renderSelector(
    props: Partial<ParentTermSelectorProps> & { vocabularyIri: string },
    ref: React.RefObject<ParentTermSelector> = React.createRef()
  ) {
    const { terminalStates, ...rest } = props;
    return renderWithIntl(
      <MemoryRouter>
        <ParentTermSelector
          ref={ref}
          id="test"
          onChange={onChange}
          loadTerms={loadTerms}
          loadImportedVocabularies={loadImports}
          terminalStates={terminalStates || []}
          flatList={false}
          setTermsFlatList={noop}
          {...rest}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
  }

  it("passes selected parents as value to tree component when there are multiple", () => {
    const vocabulary = new Vocabulary({
      iri: vocabularyIri,
      label: langString("Test vocabulary"),
    });
    vocabulary.allImportedVocabularies = [];
    const parentTerms = [
      Generator.generateTerm(vocabularyIri),
      Generator.generateTerm(vocabularyIri),
    ];
    const { container } = renderSelector({
      termIri: Generator.generateUri(),
      vocabularyIri,
      currentVocabulary: vocabulary,
      parentTerms,
    });
    expect(treeSelectValue(container)).toEqual(parentTerms.map((p) => p.iri));
  });

  it("invokes onChange with correct parent object on selection", () => {
    const terms = [Generator.generateTerm()];
    const ref = React.createRef<ParentTermSelector>();
    renderSelector({ termIri: Generator.generateUri(), vocabularyIri }, ref);
    ref.current!.onChange([terms[0]]);
    expect(onChange).toHaveBeenCalledWith([terms[0]]);
  });

  it("supports selection of multiple parents", () => {
    const terms = [Generator.generateTerm(), Generator.generateTerm()];
    const ref = React.createRef<ParentTermSelector>();
    renderSelector({ termIri: Generator.generateUri(), vocabularyIri }, ref);
    ref.current!.onChange(terms);
    expect(onChange).toHaveBeenCalledWith(terms);
  });

  it("filters out selected parent if it is the same as the term itself", () => {
    const term = Generator.generateTerm(vocabularyIri);
    const ref = React.createRef<ParentTermSelector>();
    renderSelector({ termIri: term.iri, vocabularyIri }, ref);
    ref.current!.onChange([term]);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  describe("fetchOptions", () => {
    it("fetches terms including imported when configured to", () => {
      const ref = React.createRef<ParentTermSelector>();
      renderSelector(
        {
          termIri: Generator.generateUri(),
          vocabularyIri,
        },
        ref
      );
      act(() => ref.current!.setState({ includeImported: true }));
      ref.current!.fetchOptions({});
      expect((loadTerms as Mock).mock.calls[0][0].includeImported).toBeTruthy();
    });

    it("uses vocabulary of term being toggled when loading it subterms", () => {
      const parent = new Term({
        iri: Generator.generateUri(),
        label: langString("parent"),
        vocabulary: { iri: vocabularyIri },
      });
      const ref = React.createRef<ParentTermSelector>();
      renderSelector(
        {
          termIri: Generator.generateUri(),
          vocabularyIri,
        },
        ref
      );
      act(() => ref.current!.setState({ includeImported: true }));
      ref.current!.fetchOptions({ optionID: parent.iri, option: parent });
      expect((loadTerms as Mock).mock.calls[0][1]).toEqual(
        VocabularyUtils.create(parent.vocabulary!.iri!)
      );
    });

    it("filters out option with the term IRI", () => {
      const options: Term[] = [];
      for (let i = 0; i < Generator.randomInt(5, 10); i++) {
        const t = Generator.generateTerm(vocabularyIri);
        options.push(t);
      }
      const currentTerm = options[Generator.randomInt(0, options.length)];
      loadTerms = vi.fn().mockResolvedValue(options);
      const ref = React.createRef<ParentTermSelector>();
      renderSelector({ termIri: currentTerm.iri, vocabularyIri }, ref);
      return ref.current!.fetchOptions({}).then((terms) => {
        expect(terms.indexOf(currentTerm)).toEqual(-1);
      });
    });

    it("filters out options outside vocabulary import chain", () => {
      const vocabularyImports = [Generator.generateUri()];
      loadImports = vi
        .fn()
        .mockImplementation(() => Promise.resolve(vocabularyImports));
      const options: Term[] = [];
      for (let i = 0; i < Generator.randomInt(5, 10); i++) {
        const t = Generator.generateTerm(
          Generator.randomBoolean()
            ? vocabularyImports[0]
            : Generator.generateUri()
        );
        options.push(t);
      }
      loadTerms = vi.fn().mockResolvedValue(options);
      const ref = React.createRef<ParentTermSelector>();
      renderSelector(
        {
          termIri: Generator.generateUri(),
          vocabularyIri,
        },
        ref
      );
      return ref.current!.fetchOptions({}).then((terms) => {
        terms.forEach((t) => {
          expect(t.vocabulary!.iri).toEqual(vocabularyImports[0]);
        });
      });
    });

    it("removes term IRI from options subterms as well", () => {
      const options: Term[] = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      const currentTerm = options[1];
      options[0].plainSubTerms = [currentTerm.iri];
      loadTerms = vi.fn().mockResolvedValue(options);
      const ref = React.createRef<ParentTermSelector>();
      renderSelector({ termIri: currentTerm.iri, vocabularyIri }, ref);
      return ref.current!.fetchOptions({}).then((terms) => {
        expect(terms.indexOf(currentTerm)).toEqual(-1);
        expect(terms[0].plainSubTerms!.indexOf(currentTerm.iri)).toEqual(-1);
      });
    });

    it("excludes imported vocabularies when processing loaded terms when includeImported is set to false", () => {
      const terms = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
      ];
      const parent = Generator.generateTerm(Generator.generateUri());
      terms[0].parentTerms = [parent];
      loadTerms = vi.fn().mockResolvedValue(terms);
      const vocabulary = new Vocabulary({
        iri: vocabularyIri,
        label: langString("test"),
      });
      vocabulary.allImportedVocabularies = [parent.vocabulary!.iri!];
      const ref = React.createRef<ParentTermSelector>();
      renderSelector(
        {
          termIri: Generator.generateUri(),
          vocabularyIri,
        },
        ref
      );
      return ref
        .current!.fetchOptions({ searchString: "test" })
        .then((options) => {
          expect(options.length).toEqual(1);
          expect(options).toEqual([terms[0]]);
        });
    });

    it("passes existing parent terms for inclusion to term loading", () => {
      const existingParents = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      const ref = React.createRef<ParentTermSelector>();
      renderSelector(
        {
          termIri: Generator.generateUri(),
          vocabularyIri,
          parentTerms: existingParents,
        },
        ref
      );
      ref.current!.fetchOptions({});
      expect((loadTerms as Mock).mock.calls[0][0].includeTerms).toBeDefined();
      expect((loadTerms as Mock).mock.calls[0][0].includeTerms).toEqual(
        existingParents.map((p) => p.iri)
      );
    });
  });

  it("sets includeImported to true when parent terms are from different vocabulary", () => {
    const termIri = Generator.generateUri();
    const parentTerms = [Generator.generateTerm(Generator.generateUri())];
    const ref = React.createRef<ParentTermSelector>();
    renderSelector({ termIri, vocabularyIri, parentTerms }, ref);
    expect(ref.current!.state.includeImported).toBeTruthy();
  });

  it("loads imported vocabularies on mount", () => {
    const termIri = Generator.generateUri();
    renderSelector({ termIri, vocabularyIri, parentTerms: [] });
    expect(loadImports).toHaveBeenCalledWith(
      VocabularyUtils.create(vocabularyIri)
    );
  });

  it("does not load imported vocabularies when current state vocabulary matches specified vocabulary IRI", () => {
    const vocabulary = new Vocabulary({
      iri: vocabularyIri,
      label: langString("Test vocabulary"),
    });
    vocabulary.allImportedVocabularies = [];
    const termIri = Generator.generateUri();
    renderSelector({
      termIri,
      vocabularyIri,
      currentVocabulary: vocabulary,
      parentTerms: [],
    });
    expect(loadImports).not.toHaveBeenCalled();
  });

  it("does not render selector until imported vocabularies are available", () => {
    const termIri = Generator.generateUri();
    const ref = React.createRef<ParentTermSelector>();
    const { container } = renderSelector(
      { termIri, vocabularyIri, parentTerms: [] },
      ref
    );
    expect(
      container.querySelector("[data-testid='tree-select']")
    ).not.toBeInTheDocument();
    act(() => ref.current!.setState({ importedVocabularies: [] }));
    expect(
      container.querySelector("[data-testid='tree-select']")
    ).toBeInTheDocument();
  });

  it("disables include imported terms toggle when fetching terms", async () => {
    const ref = React.createRef<ParentTermSelector>();
    const { rerender } = renderSelector(
      {
        termIri: Generator.generateUri(),
        vocabularyIri,
        parentTerms: [],
      },
      ref
    );
    expect(ref.current!.state.disableIncludeImportedToggle).toBeFalsy();
    loadTerms = vi.fn().mockImplementation(() => Promise.resolve([]));
    rerender(
      selectorElement(
        { termIri: Generator.generateUri(), vocabularyIri, parentTerms: [] },
        ref
      )
    );
    let promise!: Promise<unknown>;
    act(() => {
      promise = ref.current!.fetchOptions({});
    });
    expect(loadTerms).toHaveBeenCalled();
    expect(ref.current!.state.disableIncludeImportedToggle).toBeTruthy();
    await act(async () => {
      await promise;
    });
    expect(ref.current!.state.disableIncludeImportedToggle).toBeFalsy();
  });

  function selectorElement(
    props: Partial<ParentTermSelectorProps> & { vocabularyIri: string },
    ref?: React.RefObject<ParentTermSelector>
  ) {
    const { terminalStates, ...rest } = props;
    return (
      <MemoryRouter>
        <ParentTermSelector
          ref={ref}
          id="test"
          onChange={onChange}
          loadTerms={loadTerms}
          loadImportedVocabularies={loadImports}
          terminalStates={terminalStates || []}
          flatList={false}
          setTermsFlatList={noop}
          {...rest}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
  }
});
