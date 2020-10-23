import * as React from "react";
import {createMemoryHistory, Location} from "history";
import {match as Match} from "react-router";
import {shallow} from "enzyme";
import {TermDetail} from "../TermDetail";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import TermMetadata from "../TermMetadata";
import TermMetadataEdit from "../TermMetadataEdit";
import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import AppNotification from "../../../model/AppNotification";
import NotificationType from "../../../model/NotificationType";
import {IRI} from "../../../util/VocabularyUtils";
import Vocabulary from "../../../model/Vocabulary";
import {langString} from "../../../model/MultilingualString";
import ValidationResult from "../../../model/ValidationResult";

jest.mock("../TermAssignments");
jest.mock("../ParentTermSelector");
jest.mock("../../misc/AssetLabel");
jest.mock("../../changetracking/AssetHistory");

describe("TermDetail", () => {

    const normalizedTermName = "test-term";
    const normalizedVocabName = "test-vocabulary";

    let location: Location;
    const history = createMemoryHistory();
    let match: Match<any>;

    let onLoad: (termName: string, vocabIri: IRI) => void;
    let loadVocabulary: (iri: IRI) => void;
    let onUpdate: (term: Term) => Promise<any>;
    let removeTerm: (term: Term) => Promise<any>;
    let onPublishNotification: (notification: AppNotification) => void;
    let loadValidationResults: (vocabularyIri: IRI) => Promise<ValidationResult[]>;

    let vocabulary: Vocabulary;
    let term: Term;

    const validationResultsArray:(sourceShapes: string[]) =>  ValidationResult[]= (sourceShapes) => {
        return sourceShapes.map((sourceShape)=>{
            return {
                id : "some-id",
                term,
                severity : {iri:"http://www.w3.org/ns/shacl#Violation"},
                message : [{language:"en", value: "some-value"}],
                sourceShape:{iri:sourceShape},
            }
        })
    };

    beforeEach(() => {
        location = {
            pathname: "/vocabulary/" + normalizedVocabName + "/term/" + normalizedTermName,
            search: "",
            hash: "",
            state: {}
        };
        match = {
            params: {
                name: normalizedVocabName,
                termName: normalizedTermName
            },
            path: location.pathname,
            isExact: true,
            url: "http://localhost:3000/" + location.pathname
        };
        onLoad = jest.fn();
        loadVocabulary = jest.fn();
        onUpdate = jest.fn().mockImplementation(() => Promise.resolve());
        removeTerm = jest.fn().mockImplementation(() => Promise.resolve());
        onPublishNotification = jest.fn();
        vocabulary = Generator.generateVocabulary();
        loadValidationResults = jest.fn().mockImplementation(() => Promise.resolve(validationResultsArray([])));
        term = new Term({
            iri: Generator.generateUri(),
            label: langString("Test term"),
            vocabulary: {iri: Generator.generateUri()},
            draft: true
        });
    });

    it("loads term on mount", () => {
        shallow(<TermDetail term={null} loadTerm={onLoad} updateTerm={onUpdate} removeTerm={removeTerm}
                            loadVocabulary={loadVocabulary}
                            publishNotification={onPublishNotification} vocabulary={vocabulary}
                            history={history} location={location} match={match} loadValidationResults={loadValidationResults}
                            {...intlFunctions()}/>);
        expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {fragment: normalizedVocabName});
    });

    it("provides namespace to term loading when specified in url", () => {
        const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
        location.search = "?namespace=" + namespace;
        shallow(<TermDetail term={null} loadTerm={onLoad} updateTerm={onUpdate} removeTerm={removeTerm}
                            loadVocabulary={loadVocabulary}
                            history={history} location={location} match={match} vocabulary={vocabulary}
                            publishNotification={onPublishNotification} loadValidationResults={loadValidationResults}
                            {...intlFunctions()}/>);
        expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {fragment: normalizedVocabName, namespace});
    });

    it("renders term metadata by default", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} loadVocabulary={loadVocabulary}
                                            updateTerm={onUpdate}
                                            removeTerm={removeTerm}
                                            vocabulary={vocabulary}
                                            publishNotification={onPublishNotification}
                                            history={history} location={location} match={match}
                                            loadValidationResults={loadValidationResults}
                                            {...intlFunctions()}/>);
        expect(wrapper.exists(TermMetadata)).toBeTruthy();
    });

    it("renders term editor after clicking edit button", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} loadVocabulary={loadVocabulary}
                                            updateTerm={onUpdate}
                                            removeTerm={removeTerm}
                                            vocabulary={vocabulary}
                                            publishNotification={onPublishNotification}
                                            history={history} location={location} match={match} loadValidationResults={loadValidationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onEdit();
        expect(wrapper.find(TermMetadataEdit).exists()).toBeTruthy();
    });

    it("invokes termUpdate action on save", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} updateTerm={onUpdate}
                                            removeTerm={removeTerm}
                                            loadVocabulary={loadVocabulary} vocabulary={vocabulary}
                                            history={history} location={location} match={match}
                                            publishNotification={onPublishNotification} loadValidationResults={loadValidationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onSave(term);
        expect(onUpdate).toHaveBeenCalledWith(term);
    });

    it("closes term metadata edit on save success", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} loadVocabulary={loadVocabulary}
                                            updateTerm={onUpdate}
                                            removeTerm={removeTerm}
                                            publishNotification={onPublishNotification}
                                            history={history} location={location} match={match} vocabulary={vocabulary}
                                            loadValidationResults={loadValidationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onEdit();
        (wrapper.instance() as TermDetail).onSave(term);
        return Promise.resolve().then(() => {
            wrapper.update();
            expect((wrapper.instance() as TermDetail).state.edit).toBeFalsy();
        });
    });

    it("reloads term on successful save", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} updateTerm={onUpdate}
                                            removeTerm={removeTerm}
                                            loadVocabulary={loadVocabulary} vocabulary={vocabulary}
                                            history={history} location={location} match={match}
                                            publishNotification={onPublishNotification} loadValidationResults={loadValidationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onSave(term);
        return Promise.resolve().then(() => {
            expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {fragment: normalizedVocabName});
        });
    });

    it("closes edit when different term is selected", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} updateTerm={onUpdate}
                                            removeTerm={removeTerm}
                                            loadVocabulary={loadVocabulary} vocabulary={vocabulary}
                                            history={history} location={location} match={match}
                                            publishNotification={onPublishNotification} loadValidationResults={loadValidationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onEdit();
        wrapper.update();
        expect((wrapper.instance() as TermDetail).state.edit).toBeTruthy();
        const newMatch = {
            params: {
                name: normalizedVocabName,
                termName: "differentTerm"
            },
            path: "/different",
            isExact: true,
            url: "http://localhost:3000/different"
        };
        wrapper.setProps({match: newMatch});
        wrapper.update();
        expect((wrapper.instance() as TermDetail).state.edit).toBeFalsy();
    });

    it("does not render edit button when editing", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} loadVocabulary={loadVocabulary}
                                            updateTerm={onUpdate}
                                            removeTerm={removeTerm}
                                            vocabulary={vocabulary}
                                            publishNotification={onPublishNotification}
                                            history={history} location={location} match={match}
                                            loadValidationResults={loadValidationResults}
                                            {...intlFunctions()}/>);
        const buttons = (wrapper.instance() as TermDetail).getActions();
        expect(buttons.some(b => b.key === "term-detail-edit"));
        (wrapper.instance() as TermDetail).onEdit();
        expect(buttons.every(b => b.key !== "term-detail-edit"));
    });

    it("publishes term update notification when parent term changes", () => {
        const wrapper = shallow<TermDetail>(<TermDetail term={term} loadTerm={onLoad} updateTerm={onUpdate}
                                                        removeTerm={removeTerm}
                                                        loadVocabulary={loadVocabulary} vocabulary={vocabulary}
                                                        history={history} location={location} match={match}
                                                        publishNotification={onPublishNotification}
                                                        loadValidationResults={loadValidationResults}
                                                        {...intlFunctions()}/>);
        const update = new Term(Object.assign({}, term));
        const newParent = Generator.generateUri();
        update.parentTerms = [new Term({iri: newParent, label: langString("New parent"), draft: true})];
        wrapper.instance().onSave(update);
        return Promise.resolve().then(() => {
            expect(onPublishNotification).toHaveBeenCalledWith({source: {type: NotificationType.TERM_HIERARCHY_UPDATED}});
        });
    });
    it("invokes remove action and closes remove confirmation dialog on remove", () => {
        const wrapper = shallow<TermDetail>(<TermDetail term={term}
                                                        loadTerm={onLoad}
                                                        updateTerm={onUpdate}
                                                        removeTerm={removeTerm}
                                                        loadVocabulary={loadVocabulary}
                                                        vocabulary={vocabulary}
                                                        history={history}
                                                        location={location}
                                                        match={match}
                                                        publishNotification={onPublishNotification}
                                                        loadValidationResults={loadValidationResults}
                                                        {...intlFunctions()}/>);
        wrapper.instance().onRemove();
        expect(removeTerm).toHaveBeenCalledWith(term);
        expect(wrapper.state("showRemoveDialog")).toBeFalsy();
    });
});
