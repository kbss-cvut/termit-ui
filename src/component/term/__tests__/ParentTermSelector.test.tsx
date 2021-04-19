import * as React from "react";
import {shallow} from "enzyme";
import {ParentTermSelector} from "../ParentTermSelector";
import Generator from "../../../__tests__/environment/Generator";
import FetchOptionsFunction from "../../../model/Functions";
import Term from "../../../model/Term";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import * as TermTreeSelectHelper from "../TermTreeSelectHelper";
import {langString} from "../../../model/MultilingualString";

jest.mock("../../../util/StorageUtils");

describe("ParentTermSelector", () => {
  const vocabularyIri = Generator.generateUri();

  let onChange: (parents: Term[]) => void;
  let loadTerms: (
    fetchOptions: FetchOptionsFunction
  ) => Promise<Term[]>;
  let fetchFunctions: any;

  beforeEach(() => {
    onChange = jest.fn();
    loadTerms = jest.fn().mockResolvedValue([]);
    fetchFunctions = {
      loadTerms
    };
  });

  it("passes selected parent as value to tree component", () => {
    const parent = [Generator.generateTerm(vocabularyIri)];
    const wrapper = shallow(
      <ParentTermSelector
        id="test"
        termIri={Generator.generateUri()}
        parentTerms={parent}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        {...fetchFunctions}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual([
      parent[0].iri,
    ]);
  });

  it("passes selected parents as value to tree component when there are multiple", () => {
    const parents = [
      Generator.generateTerm(vocabularyIri),
      Generator.generateTerm(vocabularyIri),
    ];
    const wrapper = shallow(
      <ParentTermSelector
        id="test"
        termIri={Generator.generateUri()}
        parentTerms={parents}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        {...fetchFunctions}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual(
      parents.map((p) => p.iri)
    );
  });

  it("invokes onChange with correct parent object on selection", () => {
    const terms = [Generator.generateTerm()];
    const wrapper = shallow<ParentTermSelector>(
      <ParentTermSelector
        id="test"
        termIri={Generator.generateUri()}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        {...fetchFunctions}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onChange([terms[0]]);
    expect(onChange).toHaveBeenCalledWith([terms[0]]);
  });

  it("supports selection of multiple parents", () => {
    const terms = [Generator.generateTerm(), Generator.generateTerm()];
    const wrapper = shallow<ParentTermSelector>(
      <ParentTermSelector
        id="test"
        termIri={Generator.generateUri()}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        {...fetchFunctions}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onChange(terms);
    expect(onChange).toHaveBeenCalledWith(terms);
  });

  it("filters out selected parent if it is the same as the term itself", () => {
    const term = Generator.generateTerm(vocabularyIri);
    const wrapper = shallow<ParentTermSelector>(
      <ParentTermSelector
        id="test"
        termIri={term.iri}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        {...fetchFunctions}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onChange([term]);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("handles selection reset by passing empty array to onChange handler", () => {
    const term = Generator.generateTerm(vocabularyIri);
    const wrapper = shallow<ParentTermSelector>(
      <ParentTermSelector
        id="test"
        termIri={term.iri}
        vocabularyIri={Generator.generateUri()}
        onChange={onChange}
        {...fetchFunctions}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onChange(null);
    expect(onChange).toHaveBeenCalledWith([]);
  });

    it("passes term being toggled to subterm loading", () => {
      const parent = new Term({
        iri: Generator.generateUri(),
        label: langString("parent"),
        vocabulary: { iri: vocabularyIri },
      });
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={Generator.generateUri()}
          vocabularyIri={Generator.generateUri()}
          onChange={onChange}
          {...fetchFunctions}
          {...intlFunctions()}
        />
      );
      wrapper.update();
      wrapper.instance().fetchOptions({ optionID: parent.iri, option: parent });
      expect((loadTerms as jest.Mock).mock.calls[0][0]
      ).toMatchObject({ optionID: parent.iri });
    });

    it("filters out option with the term IRI", () => {
      const options: Term[] = [];
      for (let i = 0; i < Generator.randomInt(5, 10); i++) {
        const t = Generator.generateTerm(vocabularyIri);
        options.push(t);
      }
      const currentTerm = options[Generator.randomInt(0, options.length)];
      (loadTerms as jest.Mock).mockResolvedValue(options);
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={currentTerm.iri}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          {...fetchFunctions}
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

    it("removes term IRI from options subterms as well", () => {
      const options: Term[] = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      const currentTerm = options[1];
      options[0].plainSubTerms = [currentTerm.iri];
      (loadTerms as jest.Mock).mockResolvedValue(options);
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={currentTerm.iri}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          {...fetchFunctions}
          {...intlFunctions()}
        />
      );
      return wrapper
        .instance()
        .fetchOptions({})
        .then((terms) => {
          expect(terms.indexOf(currentTerm)).toEqual(-1);
          expect(terms[0].plainSubTerms!.indexOf(currentTerm.iri)).toEqual(-1);
        });
    });

    it("does not exclude parent term vocabularies when processing loaded terms", () => {
      const terms = [Generator.generateTerm(vocabularyIri)];
      const parent = Generator.generateTerm(Generator.generateUri());
      terms[0].parentTerms = [parent];
      (loadTerms as jest.Mock).mockResolvedValue(terms);
      const spy = jest.spyOn(TermTreeSelectHelper, "processTermsForTreeSelect");
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={Generator.generateUri()}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          parentTerms={[parent]}
          {...fetchFunctions}
          {...intlFunctions()}
        />
      );
      return wrapper
        .instance()
        .fetchOptions({ searchString: "test" })
        .then((options) => {
          expect(options.length).toEqual(2);
          expect(options).toEqual([parent, ...terms]);
          expect(spy).toHaveBeenCalledWith(
            terms,
            undefined,
            { searchString: "test" }
          );
        });
    });

    it("add term's parents to the beginning of the options list", () => {
      const options: Term[] = [];
      for (let i = 0; i < Generator.randomInt(5, 10); i++) {
        const t = Generator.generateTerm(vocabularyIri);
        options.push(t);
      }
      const parentTerms = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      (loadTerms as jest.Mock).mockResolvedValue(options);
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={Generator.generateUri()}
          parentTerms={parentTerms}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          {...fetchFunctions}
          {...intlFunctions()}
        />
      );
      return wrapper
        .instance()
        .fetchOptions({})
        .then((terms) => {
          expect(terms).toEqual(parentTerms.concat(options));
        });
    });
  });
