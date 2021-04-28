import * as React from "react";
import { shallow } from "enzyme";
import { PAGE_SIZE, ParentTermSelector } from "../ParentTermSelector";
import Generator from "../../../__tests__/environment/Generator";
import FetchOptionsFunction from "../../../model/Functions";
import Term from "../../../model/Term";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import * as TermTreeSelectHelper from "../TermTreeSelectHelper";
import { langString } from "../../../model/MultilingualString";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";

jest.mock("../../../util/StorageUtils");

describe("ParentTermSelector", () => {
  const vocabularyIri = Generator.generateUri();

  let onChange: (parents: Term[]) => void;
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
  let fetchFunctions: any;

  beforeEach(() => {
    onChange = jest.fn();
    loadTermsFromVocabulary = jest.fn().mockResolvedValue([]);
    loadTermsFromCurrentWorkspace = jest.fn().mockResolvedValue([]);
    loadTermsFromCanonical = jest.fn().mockResolvedValue([]);
    fetchFunctions = {
      loadTermsFromVocabulary,
      loadTermsFromCurrentWorkspace,
      loadTermsFromCanonical,
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

  function generateTerms(count: number, vocabularyIri?: string) {
    const options: Term[] = [];
    for (let i = 0; i < count; i++) {
      options.push(Generator.generateTerm(vocabularyIri));
    }
    return options;
  }

  it("passes selected parents as value to tree component when there are multiple", () => {
    const parents = generateTerms(2, vocabularyIri);
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
    const terms = generateTerms(2);
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
    expect(
      (loadTermsFromVocabulary as jest.Mock).mock.calls[0][0]
    ).toMatchObject({
      optionID: parent.iri,
    });
  });

  it("filters out option with the term IRI", () => {
    const options: Term[] = generateTerms(PAGE_SIZE, vocabularyIri);
    const currentTerm = options[Generator.randomInt(0, options.length)];
    (loadTermsFromVocabulary as jest.Mock).mockResolvedValue(options);
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
    const options: Term[] = generateTerms(PAGE_SIZE, vocabularyIri);
    const currentTerm = options[1];
    options[0].plainSubTerms = [currentTerm.iri];
    (loadTermsFromVocabulary as jest.Mock).mockResolvedValue(options);
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
    (loadTermsFromVocabulary as jest.Mock).mockResolvedValue(terms);
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
        expect(spy).toHaveBeenCalledWith(terms, undefined, {
          searchString: "test",
        });
      });
  });

  it("add term's parents to the beginning of the options list", () => {
    const options: Term[] = generateTerms(PAGE_SIZE, vocabularyIri);
    const parentTerms = generateTerms(2, vocabularyIri);
    (loadTermsFromVocabulary as jest.Mock).mockResolvedValue(options);
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

  it("fetches workspace terms after vocabulary terms when vocabulary terms page is less than configured", () => {
    const vocOptions: Term[] = generateTerms(2, vocabularyIri);
    const wsOptions: Term[] = generateTerms(PAGE_SIZE);
    (loadTermsFromVocabulary as jest.Mock).mockResolvedValue(vocOptions);
    (loadTermsFromCurrentWorkspace as jest.Mock).mockResolvedValue(wsOptions);
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
    return wrapper
      .instance()
      .fetchOptions({})
      .then((terms) => {
        expect(loadTermsFromVocabulary).toHaveBeenCalled();
        expect(loadTermsFromCurrentWorkspace).toHaveBeenCalled();
        expect(terms).toEqual(vocOptions.concat(wsOptions));
      });
  });

  it("fetches canonical container terms after vocabulary and workspace terms when their pages together are less than configured", () => {
    const vocOptions: Term[] = generateTerms(2, vocabularyIri);
    const wsOptions: Term[] = generateTerms(2);
    const canOptions: Term[] = generateTerms(5);
    (loadTermsFromVocabulary as jest.Mock).mockResolvedValue(vocOptions);
    (loadTermsFromCurrentWorkspace as jest.Mock).mockResolvedValue(wsOptions);
    (loadTermsFromCanonical as jest.Mock).mockResolvedValue(canOptions);
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
    return wrapper
      .instance()
      .fetchOptions({})
      .then((terms) => {
        expect(loadTermsFromVocabulary).toHaveBeenCalled();
        expect(loadTermsFromCurrentWorkspace).toHaveBeenCalled();
        expect(loadTermsFromCanonical).toHaveBeenCalled();
        expect(terms).toEqual(vocOptions.concat(wsOptions).concat(canOptions));
      });
  });

  it("fetches workspace terms with correct offset when vocabulary terms are all already loaded", () => {
    const wsOptions: Term[] = generateTerms(PAGE_SIZE);
    (loadTermsFromCurrentWorkspace as jest.Mock).mockResolvedValue(wsOptions);
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
    const vocabularyTermCount = Generator.randomInt(0, PAGE_SIZE - 1);
    wrapper.setState({ allVocabularyTerms: true, vocabularyTermCount });
    const offset = vocabularyTermCount + PAGE_SIZE - 5;
    return wrapper
      .instance()
      .fetchOptions({ offset })
      .then(() => {
        expect(loadTermsFromCurrentWorkspace).toHaveBeenCalledWith(
          expect.objectContaining({ offset: offset - vocabularyTermCount }),
          vocabularyIri
        );
      });
  });

  it("fetches canonical container terms with correct offset when vocabulary and workspace terms are all alraedy loaded", () => {
    const canOptions: Term[] = generateTerms(PAGE_SIZE);
    (loadTermsFromCanonical as jest.Mock).mockResolvedValue(canOptions);
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
    const vocabularyTermCount = Generator.randomInt(0, PAGE_SIZE - 1);
    const workspaceTermCount = PAGE_SIZE + Generator.randomInt(5, 10);
    wrapper.setState({
      allVocabularyTerms: true,
      vocabularyTermCount,
      allWorkspaceTerms: true,
      workspaceTermCount,
    });
    const offset = vocabularyTermCount + workspaceTermCount + PAGE_SIZE - 3;
    return wrapper
      .instance()
      .fetchOptions({ offset })
      .then(() => {
        expect(loadTermsFromCanonical).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: offset - (vocabularyTermCount + workspaceTermCount),
          })
        );
      });
  });

  it("resets vocabulary and workspace term fetch status when search string is provided", () => {
    const vocOptions: Term[] = generateTerms(PAGE_SIZE, vocabularyIri);
    (loadTermsFromVocabulary as jest.Mock).mockResolvedValue(vocOptions);
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
    const searchString = "te";
    wrapper.setState({
      allVocabularyTerms: true,
      vocabularyTermCount: 30,
      allWorkspaceTerms: true,
      workspaceTermCount: 100,
    });
    return wrapper
      .instance()
      .fetchOptions({ searchString })
      .then(() => {
        wrapper.update();
        expect(wrapper.state()).toEqual(
          expect.objectContaining({
            allVocabularyTerms: false,
            vocabularyTermCount: vocOptions.length,
            allWorkspaceTerms: false,
            workspaceTermCount: 0,
          })
        );
        expect(loadTermsFromVocabulary).toHaveBeenCalledWith(
          expect.objectContaining({ offset: 0, searchString }),
          VocabularyUtils.create(vocabularyIri)
        );
      });
  });
});
