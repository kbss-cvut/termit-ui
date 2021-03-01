import * as React from "react";
import {shallow} from "enzyme";
import {ParentSelectorRange, ParentTermSelector} from "../ParentTermSelector";
import Generator from "../../../__tests__/environment/Generator";
import FetchOptionsFunction from "../../../model/Functions";
import VocabularyUtils, {IRI} from "../../../util/VocabularyUtils";
import Term from "../../../model/Term";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import * as TermTreeSelectHelper from "../TermTreeSelectHelper";
import {langString} from "../../../model/MultilingualString";
import StorageUtils from "../../../util/StorageUtils";
import Constants from "../../../util/Constants";

jest.mock("../../../util/StorageUtils");

describe("ParentTermSelector", () => {

    const vocabularyIri = Generator.generateUri();

    let onChange: (parents: Term[]) => void;
    let loadTermsFromVocabulary: (fetchOptions: FetchOptionsFunction, vocabularyIri: IRI) => Promise<Term[]>;
    let loadTermsFromWorkspace: (fetchOptions: FetchOptionsFunction) => Promise<Term[]>;
    let loadTermsIncludingCanonical: (fetchOptions: FetchOptionsFunction) => Promise<Term[]>;
    let fetchFunctions: any;

    beforeEach(() => {
        onChange = jest.fn();
        loadTermsFromVocabulary = jest.fn().mockResolvedValue([]);
        loadTermsFromWorkspace = jest.fn().mockResolvedValue([]);
        loadTermsIncludingCanonical = jest.fn().mockResolvedValue([]);
        fetchFunctions = {
            loadTermsIncludingCanonical, loadTermsFromWorkspace, loadTermsFromVocabulary
        };
    });

    it("passes selected parent as value to tree component", () => {
        const parent = [Generator.generateTerm(vocabularyIri)];
        const wrapper = shallow(<ParentTermSelector id="test" termIri={Generator.generateUri()} parentTerms={parent}
                                                    vocabularyIri={vocabularyIri} onChange={onChange}
                                                    {...fetchFunctions} {...intlFunctions()}/>);
        expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual([parent[0].iri]);
    });

    it("passes selected parents as value to tree component when there are multiple", () => {
        const parents = [Generator.generateTerm(vocabularyIri), Generator.generateTerm(vocabularyIri)];
        const wrapper = shallow(<ParentTermSelector id="test" termIri={Generator.generateUri()} parentTerms={parents}
                                                    vocabularyIri={vocabularyIri} onChange={onChange}
                                                    {...fetchFunctions} {...intlFunctions()}/>);
        expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual(parents.map(p => p.iri));
    });

    it("invokes onChange with correct parent object on selection", () => {
        const terms = [Generator.generateTerm()];
        const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                        vocabularyIri={vocabularyIri}
                                                                        onChange={onChange}
                                                                        {...fetchFunctions} {...intlFunctions()}/>);
        wrapper.instance().onChange([terms[0]]);
        expect(onChange).toHaveBeenCalledWith([terms[0]]);
    });

    it("supports selection of multiple parents", () => {
        const terms = [Generator.generateTerm(), Generator.generateTerm()];
        const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                        vocabularyIri={vocabularyIri}
                                                                        onChange={onChange}
                                                                        {...fetchFunctions} {...intlFunctions()}/>);
        wrapper.instance().onChange(terms);
        expect(onChange).toHaveBeenCalledWith(terms);
    });

    it("filters out selected parent if it is the same as the term itself", () => {
        const term = Generator.generateTerm(vocabularyIri);
        const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={term.iri}
                                                                        vocabularyIri={vocabularyIri}
                                                                        onChange={onChange}
                                                                        {...fetchFunctions} {...intlFunctions()}/>);
        wrapper.instance().onChange([term]);
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it("handles selection reset by passing empty array to onChange handler", () => {
        const term = Generator.generateTerm(vocabularyIri);
        const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={term.iri}
                                                                        vocabularyIri={Generator.generateUri()}
                                                                        onChange={onChange}
                                                                        {...fetchFunctions} {...intlFunctions()}/>);
        wrapper.instance().onChange(null);
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it("loads selector config on mount", () => {
        shallow(<ParentTermSelector id="test" termIri={Generator.generateUri()} parentTerms={[]}
                                    vocabularyIri={vocabularyIri} onChange={onChange}
                                    {...fetchFunctions} {...intlFunctions()}/>);
        expect(StorageUtils.load).toHaveBeenCalledWith(Constants.STORAGE_PARENT_SELECTOR_RANGE, ParentSelectorRange.VOCABULARY);
    });

    it("saves selector config on unmount", () => {
        const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                        parentTerms={[]}
                                                                        vocabularyIri={vocabularyIri}
                                                                        onChange={onChange}
                                                                        {...fetchFunctions} {...intlFunctions()}/>);
        const config = ParentSelectorRange.WORKSPACE;
        wrapper.setState({selectorRange: config});
        wrapper.unmount();
        expect(StorageUtils.save).toHaveBeenCalledWith(Constants.STORAGE_PARENT_SELECTOR_RANGE, config);
    });

    describe("fetchOptions", () => {
        it("fetches terms from whole workspace when configured to", () => {
            const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                            vocabularyIri={vocabularyIri}
                                                                            onChange={onChange}
                                                                            {...fetchFunctions} {...intlFunctions()}/>);
            wrapper.setState({selectorRange: ParentSelectorRange.WORKSPACE});
            wrapper.update();
            wrapper.instance().fetchOptions({});
            expect(loadTermsFromWorkspace).toHaveBeenCalled();
        });

        it("fetches terms from workspace and including canonical when configured to", () => {
            const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                            vocabularyIri={vocabularyIri}
                                                                            onChange={onChange}
                                                                            {...fetchFunctions} {...intlFunctions()}/>);
            wrapper.setState({selectorRange: ParentSelectorRange.CANONICAL});
            wrapper.update();
            wrapper.instance().fetchOptions({});
            expect(loadTermsIncludingCanonical).toHaveBeenCalled();
        });

        it("uses vocabulary of term being toggled when loading it subterms", () => {
            const parent = new Term({
                iri: Generator.generateUri(),
                label: langString("parent"),
                vocabulary: {iri: vocabularyIri}
            });
            const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                            vocabularyIri={Generator.generateUri()}
                                                                            onChange={onChange}
                                                                            {...fetchFunctions} {...intlFunctions()}/>);
            wrapper.setState({selectorRange: ParentSelectorRange.VOCABULARY});
            wrapper.update();
            wrapper.instance().fetchOptions({optionID: parent.iri, option: parent});
            expect((loadTermsFromVocabulary as jest.Mock).mock.calls[0][0]).toMatchObject({optionID: parent.iri});
            expect((loadTermsFromVocabulary as jest.Mock).mock.calls[0][1]).toEqual(VocabularyUtils.create(parent.vocabulary!.iri!));
        });

        it("passes term being toggled to subterm loading from workspace", () => {
            const parent = new Term({
                iri: Generator.generateUri(),
                label: langString("parent"),
                vocabulary: {iri: vocabularyIri}
            });
            const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                            vocabularyIri={Generator.generateUri()}
                                                                            onChange={onChange}
                                                                            {...fetchFunctions} {...intlFunctions()}/>);
            wrapper.setState({selectorRange: ParentSelectorRange.WORKSPACE});
            wrapper.update();
            wrapper.instance().fetchOptions({optionID: parent.iri, option: parent});
            expect((loadTermsFromWorkspace as jest.Mock).mock.calls[0][0]).toMatchObject({optionID: parent.iri});
        });

        it("filters out option with the term IRI", () => {
            const options: Term[] = [];
            for (let i = 0; i < Generator.randomInt(5, 10); i++) {
                const t = Generator.generateTerm(vocabularyIri);
                options.push(t);
            }
            const currentTerm = options[Generator.randomInt(0, options.length)];
            loadTermsFromVocabulary = jest.fn().mockImplementation(() => Promise.resolve(options));
            const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={currentTerm.iri}
                                                                            vocabularyIri={vocabularyIri}
                                                                            onChange={onChange}
                                                                            {...fetchFunctions} {...intlFunctions()}/>);
            return wrapper.instance().fetchOptions({}).then((terms) => {
                expect(terms.indexOf(currentTerm)).toEqual(-1);
            });
        });

        it("removes term IRI from options subterms as well", () => {
            const options: Term[] = [Generator.generateTerm(vocabularyIri), Generator.generateTerm(vocabularyIri)];
            const currentTerm = options[1];
            options[0].plainSubTerms = [currentTerm.iri];
            (loadTermsFromWorkspace as jest.Mock).mockResolvedValue(options);
            const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={currentTerm.iri}
                                                                            vocabularyIri={vocabularyIri}
                                                                            onChange={onChange}
                                                                            {...fetchFunctions} {...intlFunctions()}/>);
            wrapper.setState({selectorRange: ParentSelectorRange.WORKSPACE});
            return wrapper.instance().fetchOptions({}).then((terms) => {
                expect(terms.indexOf(currentTerm)).toEqual(-1);
                expect(terms[0].plainSubTerms!.indexOf(currentTerm.iri)).toEqual(-1);
            });
        });

        it("excludes terms from other vocabularies when processing terms loaded for a single vocabulary", () => {
            const terms = [Generator.generateTerm(vocabularyIri)];
            const parent = Generator.generateTerm(Generator.generateUri());
            terms[0].parentTerms = [parent];
            (loadTermsFromVocabulary as jest.Mock).mockResolvedValue(terms);
            const spy = jest.spyOn(TermTreeSelectHelper, "processTermsForTreeSelect");
            const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                            vocabularyIri={vocabularyIri}
                                                                            onChange={onChange}
                                                                            {...fetchFunctions} {...intlFunctions()}/>);
            wrapper.setState({selectorRange: ParentSelectorRange.VOCABULARY});
            return wrapper.instance().fetchOptions({searchString: "test"}).then(options => {
                expect(options.length).toEqual(1);
                expect(options).toEqual(terms);
                expect(spy).toHaveBeenCalledWith(terms, [vocabularyIri], {searchString: "test"});
            });
        });

        it("does not exclude parent term vocabularies when processing loaded terms for a single vocabulary", () => {
            const terms = [Generator.generateTerm(vocabularyIri)];
            const parent = Generator.generateTerm(Generator.generateUri());
            terms[0].parentTerms = [parent];
            (loadTermsFromVocabulary as jest.Mock).mockResolvedValue(terms);
            const spy = jest.spyOn(TermTreeSelectHelper, "processTermsForTreeSelect");
            const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                            vocabularyIri={vocabularyIri}
                                                                            onChange={onChange}
                                                                            parentTerms={[parent]}
                                                                            {...fetchFunctions} {...intlFunctions()}/>);
            wrapper.setState({selectorRange: ParentSelectorRange.VOCABULARY});
            return wrapper.instance().fetchOptions({searchString: "test"}).then(options => {
                expect(options.length).toEqual(2);
                expect(options).toEqual([...terms, parent]);
                expect(spy).toHaveBeenCalledWith(terms, [parent.vocabulary!.iri!, vocabularyIri], {searchString: "test"});
            });
        });

        it("passes existing parent terms for inclusion to term loading from vocabulary", () => {
            const existingParents = [Generator.generateTerm(vocabularyIri), Generator.generateTerm(vocabularyIri)];
            const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                            vocabularyIri={vocabularyIri}
                                                                            onChange={onChange}
                                                                            {...fetchFunctions}
                                                                            parentTerms={existingParents} {...intlFunctions()}/>);
            wrapper.setState({selectorRange: ParentSelectorRange.VOCABULARY});
            wrapper.instance().fetchOptions({});
            expect((loadTermsFromVocabulary as jest.Mock).mock.calls[0][0].includeTerms).toBeDefined();
            expect((loadTermsFromVocabulary as jest.Mock).mock.calls[0][0].includeTerms).toEqual(existingParents.map(p => p.iri));
        });
    });

    it("disables selector config when fetching terms", () => {
        const wrapper = shallow<ParentTermSelector>(<ParentTermSelector id="test" termIri={Generator.generateUri()}
                                                                        vocabularyIri={vocabularyIri}
                                                                        onChange={onChange} parentTerms={[]}
                                                                        {...fetchFunctions} {...intlFunctions()}/>);
        wrapper.setState({selectorRange: ParentSelectorRange.VOCABULARY});
        expect(wrapper.state().disableConfig).toBeFalsy();
        loadTermsFromVocabulary = jest.fn().mockImplementation(() => {
            wrapper.update();
            expect(wrapper.state().disableConfig).toBeTruthy();
            return Promise.resolve([]);
        });
        wrapper.setProps({loadTermsFromVocabulary});
        wrapper.update();
        return wrapper.instance().fetchOptions({}).then(() => {
            expect(loadTermsFromVocabulary).toHaveBeenCalled();
            wrapper.update();
            expect(wrapper.state().disableConfig).toBeFalsy();
        });
    });
});
