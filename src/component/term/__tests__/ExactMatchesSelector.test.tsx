import * as React from "react";
import { shallow } from "enzyme";
import Generator from "../../../__tests__/environment/Generator";
import FetchOptionsFunction from "../../../model/Functions";
import { IRI } from "../../../util/VocabularyUtils";
import Term, { TermInfo } from "../../../model/Term";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import Vocabulary from "../../../model/Vocabulary";
import { ExactMatchesSelector } from "../ExactMatchesSelector";
import { langString } from "../../../model/MultilingualString";

describe("ExactMatchesSelector", () => {
  const vocabularyIri = Generator.generateUri();

  let onChange: (exactMatches: Term[]) => void;
  let loadTermsFromVocabulary: (
    fetchOptions: FetchOptionsFunction,
    vocabularyIri: IRI
  ) => Promise<Term[]>;
  let loadTermsFromCurrentWorkspace: (
    fetchOptions: FetchOptionsFunction,
    excludeVocabulary: string
  ) => Promise<Term[]>;
  let loadTermsFromCanonical: (
    fetchOptions: FetchOptionsFunction
  ) => Promise<Term[]>;
  let loadFunctions: any;

  beforeEach(() => {
    onChange = jest.fn();
    loadTermsFromVocabulary = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    loadTermsFromCurrentWorkspace = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    loadTermsFromCanonical = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    loadFunctions = {
      loadTermsFromVocabulary,
      loadTermsFromCurrentWorkspace,
      loadTermsFromCanonical,
    };
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
        {...loadFunctions}
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
        {...loadFunctions}
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
        {...loadFunctions}
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
        {...loadFunctions}
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
        {...loadFunctions}
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
        {...loadFunctions}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onChange(null);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  describe("fetchOptions", () => {
    it("filters out option with the term IRI", () => {
      const options: Term[] = [];
      for (let i = 0; i < Generator.randomInt(5, 10); i++) {
        const t = Generator.generateTerm(vocabularyIri);
        options.push(t);
      }
      const currentTerm = options[Generator.randomInt(0, options.length)];
      loadTermsFromCurrentWorkspace = jest
        .fn()
        .mockImplementation(() => Promise.resolve(options));
      const wrapper = shallow<ExactMatchesSelector>(
        <ExactMatchesSelector
          id="test"
          termIri={currentTerm.iri}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          {...loadFunctions}
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

    it("passes existing values to with options to ensure they are displayed even if there were not loaded due to paging", () => {
      const options = [
        Generator.generateTerm(),
        Generator.generateTerm(),
        Generator.generateTerm(),
      ];
      const existing: TermInfo[] = [
        {
          iri: Generator.generateUri(),
          label: langString("testExact"),
          vocabulary: { iri: Generator.generateUri() },
        },
      ];
      loadTermsFromCurrentWorkspace = jest
        .fn()
        .mockImplementation(() => Promise.resolve(options));
      const wrapper = shallow<ExactMatchesSelector>(
        <ExactMatchesSelector
          id="test"
          termIri={Generator.generateUri()}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          selected={existing}
          {...loadFunctions}
          {...intlFunctions()}
        />
      );
      return wrapper
        .instance()
        .fetchOptions({})
        .then((terms) => {
          expect(terms[0]).toEqual(new Term(existing[0]));
        });
    });
  });
});
