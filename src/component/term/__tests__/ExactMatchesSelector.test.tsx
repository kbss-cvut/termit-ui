import * as React from "react";
import { shallow } from "enzyme";
import Generator from "../../../__tests__/environment/Generator";
import FetchOptionsFunction from "../../../model/Functions";
import VocabularyUtils  from "../../../util/VocabularyUtils";
import Term from "../../../model/Term";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import Vocabulary from "../../../model/Vocabulary";
import { langString } from "../../../model/MultilingualString";
import {ExactMatchesSelector} from "../ExactMatchesSelector";

describe("ExactMatchesSelector", () => {
  const vocabularyIri = Generator.generateUri();

  let onChange: (exactMatches: Term[]) => void;
  let loadTerms: (
    fetchOptions: FetchOptionsFunction,
    namespace: string
  ) => Promise<Term[]>;

  beforeEach(() => {
    onChange = jest.fn();
    loadTerms = jest.fn().mockImplementation(() => Promise.resolve([]));
  });

  it("passes selected exact match as value to tree component", () => {
    const vocabulary = new Vocabulary({
      iri: vocabularyIri,
      label: "Test vocabulary",
    });
    const exactMatch = [Generator.generateTerm(vocabularyIri)];
    const wrapper = shallow(
      <ExactMatchesSelector
        id="test"
        termIri={Generator.generateUri()}
        selected={exactMatch}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        currentVocabulary={vocabulary}
        loadTerms={loadTerms}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual([
      exactMatch[0].iri,
    ]);
  });

  it("passes selected exact matches as value to tree component when there are multiple", () => {
    const vocabulary = new Vocabulary({
      iri: vocabularyIri,
      label: "Test vocabulary",
    });
    const exactMatches = [
      Generator.generateTerm(vocabularyIri),
      Generator.generateTerm(vocabularyIri),
    ];
    const wrapper = shallow(
      <ExactMatchesSelector
        id="test"
        termIri={Generator.generateUri()}
        selected={exactMatches}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        currentVocabulary={vocabulary}
        loadTerms={loadTerms}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual(
      exactMatches.map((p) => p.iri)
    );
  });

  it("invokes onChange with correct exact match object on selection", () => {
    const terms = [Generator.generateTerm()];
    const wrapper = shallow<ExactMatchesSelector>(
      <ExactMatchesSelector
        id="test"
        termIri={Generator.generateUri()}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        loadTerms={loadTerms}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onChange([terms[0]]);
    expect(onChange).toHaveBeenCalledWith([terms[0]]);
  });

  it("supports selection of multiple exact matches", () => {
    const terms = [Generator.generateTerm(), Generator.generateTerm()];
    const wrapper = shallow<ExactMatchesSelector>(
      <ExactMatchesSelector
        id="test"
        termIri={Generator.generateUri()}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        loadTerms={loadTerms}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onChange(terms);
    expect(onChange).toHaveBeenCalledWith(terms);
  });

  it("filters out selected exact match if it belongs to the same vocabulary", () => {
    const term = Generator.generateTerm(vocabularyIri);
    const wrapper = shallow<ExactMatchesSelector>(
      <ExactMatchesSelector
        id="test"
        termIri={term.iri}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        loadTerms={loadTerms}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onChange([term]);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("handles selection reset by passing empty array to onChange handler", () => {
    const term = Generator.generateTerm(vocabularyIri);
    const wrapper = shallow<ExactMatchesSelector>(
      <ExactMatchesSelector
        id="test"
        termIri={term.iri}
        vocabularyIri={Generator.generateUri()}
        onChange={onChange}
        loadTerms={loadTerms}
        {...intlFunctions()}
      />
    );
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
      const wrapper = shallow<ExactMatchesSelector>(
        <ExactMatchesSelector
          id="test"
          termIri={Generator.generateUri()}
          vocabularyIri={Generator.generateUri()}
          onChange={onChange}
          loadTerms={loadTerms}
          {...intlFunctions()}
        />
      );
      wrapper.instance().fetchOptions({ optionID: exactMatch.iri, option: exactMatch });
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
      const wrapper = shallow<ExactMatchesSelector>(
        <ExactMatchesSelector
          id="test"
          termIri={currentTerm.iri}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          loadTerms={loadTerms}
          {...intlFunctions()}
        />
      );
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
      const wrapper = shallow<ExactMatchesSelector>(
        <ExactMatchesSelector
          id="test"
          termIri={Generator.generateUri()}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          loadTerms={loadTerms}
          selected={existingExactMatches}
          {...intlFunctions()}
        />
      );
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
