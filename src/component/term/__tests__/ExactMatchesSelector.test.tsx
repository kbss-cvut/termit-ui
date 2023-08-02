import { shallow } from "enzyme";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Term, { TermData } from "../../../model/Term";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { langString } from "../../../model/MultilingualString";
import {
  ExactMatchesSelector,
  ExactMatchesSelectorProps,
} from "../ExactMatchesSelector";
import { TermFetchParams } from "../../../util/Types";

describe("ExactMatchesSelector", () => {
  const vocabularyIri = Generator.generateUri();

  let onChange: (exactMatches: Term[]) => void;
  let loadTerms: (
    fetchOptions: TermFetchParams<TermData>,
    namespace?: string
  ) => Promise<Term[]>;

  beforeEach(() => {
    onChange = jest.fn();
    loadTerms = jest.fn().mockImplementation(() => Promise.resolve([]));
  });

  it("passes selected exact match as value to tree component", () => {
    const exactMatch = [Generator.generateTerm(vocabularyIri)];
    const wrapper = render({
      termIri: Generator.generateUri(),
      vocabularyIri: vocabularyIri,
      selected: exactMatch,
    });
    expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual([
      exactMatch[0].iri,
    ]);
  });

  function render(
    props: Partial<ExactMatchesSelectorProps> & {
      termIri: string;
      vocabularyIri: string;
    }
  ) {
    return shallow<ExactMatchesSelector>(
      <ExactMatchesSelector
        id="test"
        states={{}}
        onChange={onChange}
        loadTerms={loadTerms}
        {...props}
        {...intlFunctions()}
      />
    );
  }

  it("passes selected exact matches as value to tree component when there are multiple", () => {
    const exactMatches = [
      Generator.generateTerm(vocabularyIri),
      Generator.generateTerm(vocabularyIri),
    ];
    const wrapper = render({
      termIri: Generator.generateUri(),
      vocabularyIri: vocabularyIri,
      selected: exactMatches,
    });
    expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual(
      exactMatches.map((p) => p.iri)
    );
  });

  it("invokes onChange with correct exact match object on selection", () => {
    const terms = [Generator.generateTerm()];
    const wrapper = render({
      termIri: Generator.generateUri(),
      vocabularyIri: vocabularyIri,
    });
    wrapper.instance().onChange([terms[0]]);
    expect(onChange).toHaveBeenCalledWith([terms[0]]);
  });

  it("supports selection of multiple exact matches", () => {
    const terms = [Generator.generateTerm(), Generator.generateTerm()];
    const wrapper = render({
      termIri: Generator.generateUri(),
      vocabularyIri: vocabularyIri,
    });
    wrapper.instance().onChange(terms);
    expect(onChange).toHaveBeenCalledWith(terms);
  });

  it("filters out selected exact match if it belongs to the same vocabulary", () => {
    const term = Generator.generateTerm(vocabularyIri);
    const wrapper = render({ termIri: term.iri, vocabularyIri: vocabularyIri });
    wrapper.instance().onChange([term]);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("handles selection reset by passing empty array to onChange handler", () => {
    const term = Generator.generateTerm(vocabularyIri);
    const wrapper = render({ termIri: term.iri, vocabularyIri: vocabularyIri });
    wrapper.instance().onChange(null);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  describe("fetchOptions", () => {
    it("uses vocabulary namespace of term being toggled when loading it subterms", () => {
      const exactMatch = new Term({
        iri: Generator.generateUri(),
        label: langString("parent"),
        vocabulary: { iri: vocabularyIri },
      });
      const wrapper = render({
        termIri: Generator.generateUri(),
        vocabularyIri: Generator.generateUri(),
      });
      wrapper
        .instance()
        .fetchOptions({ optionID: exactMatch.iri, option: exactMatch });
      expect((loadTerms as jest.Mock).mock.calls[0][1]).toEqual(
        VocabularyUtils.create(exactMatch.vocabulary!.iri!).namespace
      );
    });

    it("filters out option with the term IRI", () => {
      const options: Term[] = [];
      for (let i = 0; i < Generator.randomInt(5, 10); i++) {
        const t = Generator.generateTerm(vocabularyIri);
        options.push(t);
      }
      const currentTerm = options[Generator.randomInt(0, options.length)];
      loadTerms = jest.fn().mockImplementation(() => Promise.resolve(options));
      const wrapper = render({
        termIri: currentTerm.iri,
        vocabularyIri: vocabularyIri,
      });
      return wrapper
        .instance()
        .fetchOptions({})
        .then((terms) => {
          expect(terms.indexOf(currentTerm)).toEqual(-1);
        });
    });

    it("passes existing parent terms for inclusion to term loading", () => {
      const existingExactMatches = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      const wrapper = render({
        termIri: Generator.generateUri(),
        vocabularyIri: vocabularyIri,
        selected: existingExactMatches,
      });
      wrapper.instance().fetchOptions({});
      expect(
        (loadTerms as jest.Mock).mock.calls[0][0].includeTerms
      ).toBeDefined();
      expect((loadTerms as jest.Mock).mock.calls[0][0].includeTerms).toEqual(
        existingExactMatches.map((p) => p.iri)
      );
    });
  });
});
