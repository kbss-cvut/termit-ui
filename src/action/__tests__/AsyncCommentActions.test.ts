import configureMockStore, {MockStoreEnhanced} from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import Generator from "../../__tests__/environment/Generator";
import Ajax from "../../util/Ajax";
import {ThunkDispatch} from "../../util/Types";
import {createTermComment, loadTermComments} from "../AsyncCommentActions";
import ActionType from "../ActionType";
import AsyncActionStatus from "../AsyncActionStatus";
import Comment from "../../model/Comment";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => {
    const originalModule = jest.requireActual("../../util/Ajax");
    return {
        ...originalModule,
        default: jest.fn()
    };
});

const COMMENT_TYPE = "http://rdfs.org/sioc/types#Comment";

const mockStore = configureMockStore<TermItState>([thunk]);

describe("AsyncCommentActions", () => {
    let store: MockStoreEnhanced<TermItState>;

    beforeEach(() => {
        jest.clearAllMocks();
        store = mockStore(new TermItState());
    });

    describe("loadTermComments", () => {
        it("sends term loading request for specified term identifier", () => {
            const termIri = VocabularyUtils.create(Generator.generateUri());
            const comments = generateComments(termIri);
            Ajax.get = jest.fn().mockResolvedValue(comments);
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermComments(termIri))).then(() => {
                expect(Ajax.get).toHaveBeenCalled();
                const args = (Ajax.get as jest.Mock).mock.calls[0];
                expect(args[0]).toContain(`${termIri.fragment}/comments`);
                expect(args[1].getParams().namespace).toEqual(termIri.namespace);
                expect(store.getActions().find(a => a.type === ActionType.LOAD_COMMENTS && a.status === AsyncActionStatus.REQUEST)).toBeDefined();
            });
        });

        function generateComments(termIri: IRI) {
            const comments = [];
            for (let i = 0; i < 5; i++) {
                comments.push({
                    "@id": Generator.generateUri(),
                    "@type": [COMMENT_TYPE],
                    "http://rdfs.org/sioc/ns#content": "Test one",
                    "http://rdfs.org/sioc/ns#has_creator": require("../../rest-mock/current.json"),
                    "http://rdfs.org/sioc/ns#topic": {
                        "@id": termIri.toString()
                    }
                });
            }
            return comments;
        }

        it("returns comments extracted from response JSON-LD", () => {
            const termIri = VocabularyUtils.create(Generator.generateUri());
            const comments = generateComments(termIri);
            Ajax.get = jest.fn().mockResolvedValue(comments);
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermComments(termIri))).then((result: Comment[]) => {
                expect(Ajax.get).toHaveBeenCalled();
                expect(result.length).toEqual(comments.length);
                expect(result.map(c => c.iri)).toEqual(comments.map(c => c["@id"]));
                result.forEach(c => expect(c).toBeInstanceOf(Comment));
            });
        });

        it("returns empty array on request failure", () => {
            const termIri = VocabularyUtils.create(Generator.generateUri());
            Ajax.get = jest.fn().mockRejectedValue({status: 404, error: {message: "Term not found"}});
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermComments(termIri))).then((result: Comment[]) => {
                expect(Ajax.get).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result.length).toEqual(0);
            });
        });
    });

    describe("createTermComment", () => {

        it("sends JSON-LD serialization of specified comment to specified term endpoint", () => {
            const termIri = VocabularyUtils.create(Generator.generateUri());
            const comment = new Comment({
                content: "Test comment"
            });
            Ajax.post = jest.fn().mockResolvedValue({});
            return Promise.resolve(((store.dispatch as ThunkDispatch)(createTermComment(comment, termIri)))).then(() => {
                expect(Ajax.post).toHaveBeenCalled();
                const args = (Ajax.post as jest.Mock).mock.calls[0];
                expect(args[0]).toContain(`${termIri.fragment}/comments`);
                expect(args[1].getParams().namespace).toEqual(termIri.namespace);
                expect(args[1].getContent()).toEqual(comment.toJsonLd());
                expect(store.getActions().find(a => a.type === ActionType.CREATE_COMMENT && a.status === AsyncActionStatus.SUCCESS)).toBeDefined();
            });
        });
    });
});
