import * as React from "react";
import Term, {TermData} from "../../../../model/Term";
import VocabularyUtils, {IRI} from "../../../../util/VocabularyUtils";
import Vocabulary from "../../../../model/Vocabulary";
import FetchOptionsFunction from "../../../../model/Functions";
import {Location} from "history";
import {match as Match} from "react-router";
import Utils from "../../../../util/Utils";
import Routing from "../../../../util/Routing";
import {shallow} from "enzyme";
import {Terms} from "../Terms";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import Generator from "../../../../__tests__/environment/Generator";
import * as TermTreeSelectHelper from "../../../term/TermTreeSelectHelper";
import {langString} from "../../../../model/MultilingualString";

jest.mock("../../../../util/Routing");

describe("Terms", () => {
    const vocabularyName = "test-vocabulary";
    const termName = "test-term";
    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";

    const term: TermData = {
        iri: "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/test-vocabulary/terms/" + termName,
        label: langString("test term"),
        vocabulary: {
            iri: namespace + vocabularyName
        },
        types: [VocabularyUtils.TERM],
        draft: true
    };
    let vocabulary: Vocabulary;

    const selectedTerms: Term | null = null;
    let selectVocabularyTerm: (term: Term | null) => void;
    let fetchTerms: (fetchOptions: FetchOptionsFunction, vocabularyIri: IRI) => Promise<Term[]>;

    let location: Location;
    let match: Match<any>;

    beforeEach(() => {
        jest.resetAllMocks(); // Prevent Routing mock state leaking into subsequent tests
        Utils.calculateAssetListHeight = jest.fn().mockImplementation(() => 100);
        selectVocabularyTerm = jest.fn();
        fetchTerms = jest.fn().mockImplementation(() => Promise.resolve([]));

        location = {
            pathname: "/vocabulary/" + vocabularyName + "/term/",
            search: "",
            hash: "",
            state: {}
        };
        match = {
            params: {
                name: vocabularyName
            },
            path: location.pathname,
            isExact: true,
            url: "http://localhost:3000/" + location.pathname
        };
        vocabulary = new Vocabulary({
            iri: namespace + vocabularyName,
            label: vocabularyName
        });
    });

    it("transitions to term detail on term select", () => {
        const wrapper = renderShallow();
        wrapper.instance().onTermSelect(term);
        const call = (Routing.transitionToPublicAsset as jest.Mock).mock.calls[0];
        expect(call[0].iri).toEqual(term.iri);
        expect(call[0].vocabulary).toEqual(term.vocabulary);
        expect(call[0].types).toEqual(term.types);
    });

    function renderShallow() {
        return shallow<Terms>(
            <Terms
                selectedTerms={selectedTerms}
                selectVocabularyTerm={selectVocabularyTerm}
                vocabulary={vocabulary}
                fetchTerms={fetchTerms}
                {...intlFunctions()}
                location={location}
                match={match}
            />
        );
    }

    it("invokes term selected on term select", () => {
        const wrapper = renderShallow();
        wrapper.instance().onTermSelect(term);
        expect(selectVocabularyTerm).toHaveBeenCalled();
        expect((selectVocabularyTerm as jest.Mock).mock.calls[0][0].iri).toEqual(term.iri);
    });

    it("fetches terms including imported when configured to", () => {
        const wrapper = renderShallow();
        wrapper.setState({includeImported: true});
        wrapper.update();
        wrapper.instance().fetchOptions({});
        expect((fetchTerms as jest.Mock).mock.calls[0][0].includeImported).toBeTruthy();
    });

    it("uses term vocabulary when fetching its subterms", () => {
        const wrapper = renderShallow();
        wrapper.setState({includeImported: true});
        wrapper.update();
        const option = new Term({
            iri: Generator.generateUri(),
            label: langString("Test term"),
            vocabulary: {iri: Generator.generateUri()},
            draft: true
        });
        wrapper.instance().fetchOptions({optionID: option.iri, option});
        expect((fetchTerms as jest.Mock).mock.calls[0][1]).toEqual(VocabularyUtils.create(option.vocabulary!.iri!));
    });

    it("disables include imported terms toggle when fetching terms", () => {
        const wrapper = renderShallow();
        expect(wrapper.state().disableIncludeImportedToggle).toBeFalsy();
        fetchTerms = jest.fn().mockImplementation(() => {
            wrapper.update();
            expect(wrapper.state().disableIncludeImportedToggle).toBeTruthy();
            return Promise.resolve([]);
        });
        wrapper.setProps({fetchTerms});
        wrapper.update();
        return wrapper
            .instance()
            .fetchOptions({})
            .then(() => {
                expect(fetchTerms).toHaveBeenCalled();
                wrapper.update();
                expect(wrapper.state().disableIncludeImportedToggle).toBeFalsy();
            });
    });

    describe("fetchOptions", () => {
        it("filters out terms which are not in the vocabulary import chain", () => {
            const vocabularies = [Generator.generateUri(), Generator.generateUri(), Generator.generateUri()];
            vocabulary.allImportedVocabularies = vocabularies;
            const terms: Term[] = [];
            const matching: Term[] = [];
            for (let i = 0; i < 5; i++) {
                const termMatches = Generator.randomBoolean();
                const t = Generator.generateTerm(
                    termMatches ? Generator.randomItem(vocabularies) : Generator.generateUri()
                );
                terms.push(t);
                if (termMatches) {
                    matching.push(t);
                }
            }
            fetchTerms = jest.fn().mockResolvedValue(terms);
            const wrapper = renderShallow();
            wrapper.setState({includeImported: true});
            return wrapper
                .instance()
                .fetchOptions({})
                .then(options => {
                    expect(options).toEqual(matching);
                });
        });

        it("filters out terms from different vocabularies when vocabulary has no imports", () => {
            const terms: Term[] = [];
            const matching: Term[] = [];
            for (let i = 0; i < 5; i++) {
                const termMatches = Generator.randomBoolean();
                const t = Generator.generateTerm(termMatches ? vocabulary.iri : Generator.generateUri());
                terms.push(t);
                if (termMatches) {
                    matching.push(t);
                }
            }
            fetchTerms = jest.fn().mockResolvedValue(terms);
            const wrapper = renderShallow();
            return wrapper
                .instance()
                .fetchOptions({})
                .then(options => {
                    expect(options).toEqual(matching);
                });
        });

        it("filters out term's children which are in vocabularies outside of the vocabulary import chain", () => {
            const terms: Term[] = [Generator.generateTerm(vocabulary.iri)];
            const subTerms = [
                {
                    iri: Generator.generateUri(),
                    label: langString("child one"),
                    vocabulary: {iri: vocabulary.iri}
                },
                {
                    iri: Generator.generateUri(),
                    label: langString("child two"),
                    vocabulary: {iri: Generator.generateUri()}
                }
            ];
            terms[0].subTerms = subTerms;
            terms[0].syncPlainSubTerms();
            fetchTerms = jest.fn().mockResolvedValue(terms);
            const wrapper = renderShallow();
            return wrapper
                .instance()
                .fetchOptions({})
                .then(options => {
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
            parent.subTerms = [{iri: child.iri, label: child.label, vocabulary}];
            parent.parentTerms = [grandParent];
            grandParent.subTerms = [{iri: parent.iri, label: parent.label, vocabulary}];
            parent.syncPlainSubTerms();
            grandParent.syncPlainSubTerms();
            fetchTerms = jest.fn().mockResolvedValue([child]);
            const wrapper = renderShallow();
            return wrapper
                .instance()
                .fetchOptions({searchString: "test"})
                .then(options => {
                    expect(options.length).toEqual(3);
                    expect(options.find(t => t.iri === child.iri)).toBeDefined();
                    expect(options.find(t => t.iri === parent.iri)).toBeDefined();
                    expect(options.find(t => t.iri === grandParent.iri)).toBeDefined();
                });
        });

        it("excludes imported vocabularies when processing loaded terms when includeImported is set to false", () => {
            const terms = [Generator.generateTerm(vocabulary.iri)];
            const parent = Generator.generateTerm(Generator.generateUri());
            vocabulary.allImportedVocabularies = [parent.vocabulary!.iri!];
            terms[0].parentTerms = [parent];
            fetchTerms = jest.fn().mockResolvedValue(terms);
            const spy = jest.spyOn(TermTreeSelectHelper, "processTermsForTreeSelect");
            const wrapper = renderShallow();
            return wrapper
                .instance()
                .fetchOptions({searchString: "test"})
                .then(options => {
                    expect(options.length).toEqual(1);
                    expect(options).toEqual(terms);
                    expect(spy).toHaveBeenCalledWith(terms, [vocabulary.iri], {searchString: "test"});
                });
        });
    });
});
