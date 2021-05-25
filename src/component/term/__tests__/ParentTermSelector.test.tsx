import { shallow } from "enzyme";
import { ParentTermSelector } from "../ParentTermSelector";
import Generator from "../../../__tests__/environment/Generator";
import FetchOptionsFunction from "../../../model/Functions";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Term from "../../../model/Term";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import Vocabulary from "../../../model/Vocabulary";
import * as TermTreeSelectHelper from "../TermTreeSelectHelper";
import { langString } from "../../../model/MultilingualString";

describe("ParentTermSelector", () => {
  const vocabularyIri = Generator.generateUri();

  let onChange: (parents: Term[]) => void;
  let loadTerms: (
    fetchOptions: FetchOptionsFunction,
    vocabularyIri: IRI
  ) => Promise<Term[]>;
  let loadImports: (vocabularyIri: IRI) => Promise<string[]>;

  beforeEach(() => {
    onChange = jest.fn();
    loadTerms = jest.fn().mockResolvedValue([]);
    loadImports = jest.fn().mockResolvedValue([])
  });

  afterEach(() => {
    jest.restoreAllMocks();
  })

  it("passes selected parent as value to tree component", () => {
    const vocabulary = new Vocabulary({
      iri: vocabularyIri,
      label: "Test vocabulary",
    });
    vocabulary.allImportedVocabularies = [];
    const parent = [Generator.generateTerm(vocabularyIri)];
    const wrapper = shallow(
      <ParentTermSelector
        id="test"
        termIri={Generator.generateUri()}
        parentTerms={parent}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        currentVocabulary={vocabulary}
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual([
      parent[0].iri,
    ]);
  });

  it("passes selected parents as value to tree component when there are multiple", () => {
    const vocabulary = new Vocabulary({
      iri: vocabularyIri,
      label: "Test vocabulary",
    });
    vocabulary.allImportedVocabularies = [];
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
        currentVocabulary={vocabulary}
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
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
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
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
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
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
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
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
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onChange(null);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  describe("fetchOptions", () => {
    it("fetches terms including imported when configured to", () => {
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={Generator.generateUri()}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          loadTerms={loadTerms}
          loadImportedVocabularies={loadImports}
          {...intlFunctions()}
        />
      );
      wrapper.setState({ includeImported: true });
      wrapper.update();
      wrapper.instance().fetchOptions({});
      expect(
        (loadTerms as jest.Mock).mock.calls[0][0].includeImported
      ).toBeTruthy();
    });

    it("uses vocabulary of term being toggled when loading it subterms", () => {
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
          loadTerms={loadTerms}
          loadImportedVocabularies={loadImports}
          {...intlFunctions()}
        />
      );
      wrapper.setState({ includeImported: true });
      wrapper.update();
      wrapper.instance().fetchOptions({ optionID: parent.iri, option: parent });
      expect((loadTerms as jest.Mock).mock.calls[0][1]).toEqual(
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
      loadTerms = jest.fn().mockResolvedValue(options);
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={currentTerm.iri}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          loadTerms={loadTerms}
          loadImportedVocabularies={loadImports}
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

    it("filters out options outside vocabulary import chain", () => {
      const vocabularyImports = [Generator.generateUri()];
      loadImports = jest
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
      loadTerms = jest.fn().mockResolvedValue(options);
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={Generator.generateUri()}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          loadTerms={loadTerms}
          loadImportedVocabularies={loadImports}
          {...intlFunctions()}
        />
      );
      return wrapper
        .instance()
        .fetchOptions({})
        .then((terms) => {
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
      loadTerms = jest.fn().mockResolvedValue(options);
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={currentTerm.iri}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          loadTerms={loadTerms}
          loadImportedVocabularies={loadImports}
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

    it("excludes imported vocabularies when processing loaded terms when includeImported is set to false", () => {
      const terms = [Generator.generateTerm(vocabularyIri)];
      const parent = Generator.generateTerm(Generator.generateUri());
      terms[0].parentTerms = [parent];
      loadTerms = jest.fn().mockResolvedValue(terms);
      const spy = jest.spyOn(TermTreeSelectHelper, "processTermsForTreeSelect");
      const vocabulary = new Vocabulary({
        iri: vocabularyIri,
        label: "test",
      });
      vocabulary.allImportedVocabularies = [parent.vocabulary!.iri!];
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={Generator.generateUri()}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          loadTerms={loadTerms}
          currentVocabulary={vocabulary}
          loadImportedVocabularies={loadImports}
          {...intlFunctions()}
        />
      );
      return wrapper
        .instance()
        .fetchOptions({ searchString: "test" })
        .then((options) => {
          expect(options.length).toEqual(1);
          expect(options).toEqual(terms);
          expect(spy).toHaveBeenCalledWith(terms, [vocabularyIri], {
            searchString: "test",
          });
        });
    });

    it("passes existing parent terms for inclusion to term loading", () => {
      const existingParents = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      const wrapper = shallow<ParentTermSelector>(
        <ParentTermSelector
          id="test"
          termIri={Generator.generateUri()}
          vocabularyIri={vocabularyIri}
          onChange={onChange}
          loadTerms={loadTerms}
          parentTerms={existingParents}
          loadImportedVocabularies={loadImports}
          {...intlFunctions()}
        />
      );
      wrapper.instance().fetchOptions({});
      expect(
        (loadTerms as jest.Mock).mock.calls[0][0].includeTerms
      ).toBeDefined();
      expect((loadTerms as jest.Mock).mock.calls[0][0].includeTerms).toEqual(
        existingParents.map((p) => p.iri)
      );
    });
  });

  it("sets includeImported to true when parent terms are from different vocabulary", () => {
    const termIri = Generator.generateUri();
    const parentTerms = [Generator.generateTerm(Generator.generateUri())];
    const wrapper = shallow<ParentTermSelector>(
      <ParentTermSelector
        id="test"
        termIri={termIri}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        parentTerms={parentTerms}
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
        {...intlFunctions()}
      />
    );
    expect(wrapper.state().includeImported).toBeTruthy();
  });

  it("loads imported vocabularies on mount", () => {
    const termIri = Generator.generateUri();
    shallow<ParentTermSelector>(
      <ParentTermSelector
        id="test"
        termIri={termIri}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        parentTerms={[]}
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
        {...intlFunctions()}
      />
    );
    expect(loadImports).toHaveBeenCalledWith(
      VocabularyUtils.create(vocabularyIri)
    );
  });

  it("does not load imported vocabularies when current state vocabulary matches specified vocabulary IRI", () => {
    const vocabulary = new Vocabulary({
      iri: vocabularyIri,
      label: "Test vocabulary",
    });
    vocabulary.allImportedVocabularies = [];
    const termIri = Generator.generateUri();
    shallow<ParentTermSelector>(
      <ParentTermSelector
        id="test"
        termIri={termIri}
        vocabularyIri={vocabularyIri}
        currentVocabulary={vocabulary}
        onChange={onChange}
        parentTerms={[]}
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
        {...intlFunctions()}
      />
    );
    expect(loadImports).not.toHaveBeenCalled();
  });

  it("does not render selector until imported vocabularies are available", () => {
    const termIri = Generator.generateUri();
    const wrapper = shallow<ParentTermSelector>(
      <ParentTermSelector
        id="test"
        termIri={termIri}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        parentTerms={[]}
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
        {...intlFunctions()}
      />
    );
    expect(wrapper.exists(IntelligentTreeSelect)).toBeFalsy();
    wrapper.setState({ importedVocabularies: [] });
    wrapper.update();
    expect(wrapper.exists(IntelligentTreeSelect)).toBeTruthy();
  });

  it("disables include imported terms toggle when fetching terms", () => {
    const wrapper = shallow<ParentTermSelector>(
      <ParentTermSelector
        id="test"
        termIri={Generator.generateUri()}
        vocabularyIri={vocabularyIri}
        onChange={onChange}
        parentTerms={[]}
        loadTerms={loadTerms}
        loadImportedVocabularies={loadImports}
        {...intlFunctions()}
      />
    );
    expect(wrapper.state().disableIncludeImportedToggle).toBeFalsy();
    loadTerms = jest.fn().mockImplementation(() => {
      wrapper.update();
      expect(wrapper.state().disableIncludeImportedToggle).toBeTruthy();
      return Promise.resolve([]);
    });
    wrapper.setProps({ loadTerms });
    wrapper.update();
    return wrapper
      .instance()
      .fetchOptions({})
      .then(() => {
        expect(loadTerms).toHaveBeenCalled();
        wrapper.update();
        expect(wrapper.state().disableIncludeImportedToggle).toBeFalsy();
      });
  });
});
