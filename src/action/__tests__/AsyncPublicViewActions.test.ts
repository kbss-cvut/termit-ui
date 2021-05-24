import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import Ajax from "../../util/Ajax";
import { ThunkDispatch } from "../../util/Types";
import ActionType, { AsyncActionSuccess } from "../ActionType";
import Vocabulary from "../../model/Vocabulary";
import { verifyExpectedAssets } from "../../__tests__/environment/TestUtil";
import {
    loadPublicTerm,
    loadPublicTerms,
    loadPublicVocabularies,
    loadPublicVocabulary,
} from "../AsyncPublicViewActions";
import Constants from "../../util/Constants";
import AsyncActionStatus from "../AsyncActionStatus";
import VocabularyUtils from "../../util/VocabularyUtils";
import Term from "../../model/Term";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => ({
    default: jest.fn(),
    content: jest.requireActual("../../util/Ajax").content,
    params: jest.requireActual("../../util/Ajax").params,
    param: jest.requireActual("../../util/Ajax").param,
    accept: jest.requireActual("../../util/Ajax").accept,
    contentType: jest.requireActual("../../util/Ajax").contentType,
    formData: jest.requireActual("../../util/Ajax").formData,
}));

const mockStore = configureMockStore<TermItState>([thunk]);

describe("AsyncPublicViewActions", () => {
    let store: MockStoreEnhanced<TermItState>;

    beforeEach(() => {
        jest.clearAllMocks();
        store = mockStore(new TermItState());
    });

    describe("loadPublicVocabularies", () => {
        it("uses public API endpoint to load vocabularies into state", () => {
            const vocabularies = require("../../rest-mock/vocabularies");
            Ajax.get = jest
                .fn()
                .mockImplementation(() => Promise.resolve(vocabularies));
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(loadPublicVocabularies())
            ).then(() => {
                const url = (Ajax.get as jest.Mock).mock.calls[0][0];
                expect(url).toContain(Constants.PUBLIC_API_PREFIX);
                const loadSuccessAction: AsyncActionSuccess<Vocabulary[]> =
                    store.getActions()[1];
                const result = loadSuccessAction.payload;
                verifyExpectedAssets(vocabularies, result);
            });
        });
    });

    describe("loadPublicVocabulary", () => {
        it("uses public API endpoint to load a single vocabulary", () => {
            Ajax.get = jest
                .fn()
                .mockImplementation(() =>
                    Promise.resolve(require("../../rest-mock/vocabulary"))
                );
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    loadPublicVocabulary({ fragment: "metropolitan-plan" })
                )
            ).then(() => {
                const url = (Ajax.get as jest.Mock).mock.calls[0][0];
                expect(url).toContain(Constants.PUBLIC_API_PREFIX);
                const loadSuccessAction: AsyncActionSuccess<Vocabulary> = store
                    .getActions()
                    .find(
                        (a) =>
                            a.type === ActionType.LOAD_VOCABULARY &&
                            a.status === AsyncActionStatus.SUCCESS
                    );
                expect(loadSuccessAction).toBeDefined();
                expect(
                    VocabularyUtils.create(loadSuccessAction.payload.iri)
                        .fragment === "metropolitan-plan"
                ).toBeTruthy();
            });
        });

        it("uses public API endpoint to load vocabulary's dependencies as well", () => {
            Ajax.get = jest
                .fn()
                .mockImplementation(() =>
                    Promise.resolve(require("../../rest-mock/vocabulary"))
                );
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    loadPublicVocabulary({ fragment: "metropolitan-plan" })
                )
            ).then(() => {
                const loadDependenciesAction = store
                    .getActions()
                    .find(
                        (a) =>
                            a.type === ActionType.LOAD_VOCABULARY_DEPENDENCIES
                    );
                expect(loadDependenciesAction).toBeDefined();
                expect((Ajax.get as jest.Mock).mock.calls.length).toEqual(3);
                const url = (Ajax.get as jest.Mock).mock.calls[1][0];
                expect(url).toContain(Constants.PUBLIC_API_PREFIX);
            });
        });
    });

    describe("loadPublicTerms", () => {
        it("uses public API endpoint to fetch vocabulary terms", () => {
            const terms = require("../../rest-mock/terms");
            Ajax.get = jest
                .fn()
                .mockImplementation(() => Promise.resolve(terms));
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    loadPublicTerms(
                        {
                            searchString: "",
                            limit: 5,
                            offset: 0,
                            optionID: "",
                        },
                        { fragment: "test-vocabulary" }
                    )
                )
            ).then((data: Term[]) => {
                const url = (Ajax.get as jest.Mock).mock.calls[0][0];
                expect(url).toContain(Constants.PUBLIC_API_PREFIX);
                verifyExpectedAssets(terms, data);
            });
        });
    });

    describe("loadPublicTerm", () => {
        it("uses public API endpoint to fetch single vocabulary term", () => {
            const term = require("../../rest-mock/terms")[0];
            Ajax.get = jest
                .fn()
                .mockImplementation(() => Promise.resolve(term));
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    loadPublicTerm("test-term", { fragment: "test-vocabulary" })
                )
            ).then((data: AsyncActionSuccess<Term>) => {
                const url = (Ajax.get as jest.Mock).mock.calls[0][0];
                expect(url).toContain(Constants.PUBLIC_API_PREFIX);
                verifyExpectedAssets([term], [data.payload]);
            });
        });
    });
});
