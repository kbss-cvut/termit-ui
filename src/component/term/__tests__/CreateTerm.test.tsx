import * as React from "react";
import VocabularyUtils, {IRI} from "../../../util/VocabularyUtils";
import Term from "../../../model/Term";
import {shallow} from "enzyme";
import {CreateTerm} from "../CreateTerm";
import Vocabulary, {EMPTY_VOCABULARY} from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import TermMetadataCreate from "../TermMetadataCreate";
import {createMemoryHistory, Location} from "history";
import {match as Match} from "react-router";

jest.mock("../../../util/Routing");

describe("CreateTerm", () => {

    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
    const iri = "http://localhost:8080/termit/rest/vocabularies/test-vocabulary/terms/test-term?namespace=" + encodeURI(namespace);

    let onCreate: (term: Term, iri: IRI) => Promise<string>;
    let vocabulary: Vocabulary;
    let term: Term;
    let loadVocabulary:  (iri: IRI) => void;

    const normalizedVocabName = "test-vocabulary";

    let location: Location;
    const history = createMemoryHistory();
    let match: Match<any>;

    beforeEach(() => {
        onCreate = jest.fn().mockImplementation(() => Promise.resolve(iri));
        loadVocabulary = jest.fn();
        vocabulary = new Vocabulary({
            iri: "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/" + normalizedVocabName,
            label: "test vocabulary"
        });
        term = new Term({
            iri: Generator.generateUri(),
            label: "test term"
        });
        location = {
            pathname: `/vocabulary/${normalizedVocabName}/term/create`,
            search: "",
            hash: "",
            state: {}
        };
        match = {
            params: {
                name: normalizedVocabName,
            },
            path: location.pathname,
            isExact: true,
            url: "http://localhost:3000/" + location.pathname
        };
    });

    it("invokes on create on create call", () => {
        const wrapper = shallow(<CreateTerm createTerm={onCreate} vocabulary={vocabulary} history={history} location={location} match={match} loadVocabulary={loadVocabulary}/>);
        (wrapper.instance() as CreateTerm).onCreate(term);
        expect(onCreate).toHaveBeenCalledWith(term, VocabularyUtils.create(vocabulary.iri));
    });

    it("invokes transition to term detail on successful creation", () => {
        const wrapper = shallow<CreateTerm>(<CreateTerm createTerm={onCreate} vocabulary={vocabulary} history={history} location={location} match={match} loadVocabulary={loadVocabulary}/>);
        (wrapper.instance() as CreateTerm).onCreate(term);
        return Promise.resolve().then(() => {
            expect(Routing.transitionTo).toHaveBeenCalled();
            const call = (Routing.transitionTo as jest.Mock).mock.calls[0];
            expect(call[0]).toEqual(Routes.vocabularyTermDetail);
            expect((call[1].params as Map<string, string>).get("name")).toEqual("test-vocabulary");
            expect((call[1].params as Map<string, string>).get("termName")).toEqual("test-term");
            expect((call[1].query as Map<string, string>).get("namespace")).toEqual("http://onto.fel.cvut.cz/ontologies/termit/vocabularies/");
        });
    });

    it("does not render component while vocabulary is empty", () => {
        const wrapper = shallow<CreateTerm>(<CreateTerm createTerm={onCreate} vocabulary={EMPTY_VOCABULARY} history={history} location={location} match={match} loadVocabulary={loadVocabulary}/>);
        expect(wrapper.exists(TermMetadataCreate)).toBeFalsy();
        wrapper.setProps({vocabulary});
        expect(wrapper.exists(TermMetadataCreate)).toBeTruthy();
    });
});
