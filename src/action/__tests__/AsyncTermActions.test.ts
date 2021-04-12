import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import VocabularyUtils from "../../util/VocabularyUtils";
import Ajax from "../../util/Ajax";
import {ThunkDispatch} from "../../util/Types";
import {
    loadTermsFromWorkspace,
    loadTermsIncludingCanonical,
    setTermDefinitionSource,
    setTermStatus
} from "../AsyncTermActions";
import TermOccurrence from "../../model/TermOccurrence";
import Generator from "../../__tests__/environment/Generator";
import Term from "../../model/Term";
import ActionType from "../ActionType";
import MessageType from "../../model/MessageType";
import {langString} from "../../model/MultilingualString";
import TermStatus from "../../model/TermStatus";
import AsyncActionStatus from "../AsyncActionStatus";
import Constants from "../../util/Constants";
import FetchOptionsFunction from "../../model/Functions";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => {
    const originalModule = jest.requireActual("../../util/Ajax");
    return {
        ...originalModule,
        default: jest.fn(),
    };
});

const mockStore = configureMockStore<TermItState>([thunk]);

describe("AsyncTermActions", () => {
    const namespace = VocabularyUtils.NS_TERMIT + "/vocabularies/";
    const vocabularyName = "test-vocabulary";
    const termName = "test-term";

    let store: MockStoreEnhanced<TermItState>;

    beforeEach(() => {
        jest.clearAllMocks();
        store = mockStore(new TermItState());
    });

    describe("setTermDefinitionSource", () => {
        const term = new Term({
            iri: `${namespace}${vocabularyName}/terms/${termName}`,
            label: langString(termName),
        });
        const definitionSource = new TermOccurrence({
            term,
            target: {
                source: { iri: Generator.generateUri() },
                selectors: [
                    {
                        exactMatch: "test",
                        types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
                    },
                ],
                types: [VocabularyUtils.FILE_OCCURRENCE_TARGET],
            },
            types: [VocabularyUtils.TERM_DEFINITION_SOURCE],
        });

        it("sends PUT request with term definition source data to REST endpoint", () => {
            Ajax.put = jest.fn().mockResolvedValue(null);
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    setTermDefinitionSource(definitionSource, term)
                )
            ).then(() => {
                expect(Ajax.put).toHaveBeenCalled();
                const call = (Ajax.put as jest.Mock).mock.calls[0];
                const url = call[0];
                const config = call[1];
                expect(url).toMatch(
                    new RegExp(`terms/${termName}/definition-source$`)
                );
                expect(config.getContent()).toEqual(
                    definitionSource.toJsonLd()
                );
            });
        });

        it("publishes success message after successful request", () => {
            Ajax.put = jest.fn().mockResolvedValue(null);
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    setTermDefinitionSource(definitionSource, term)
                )
            ).then(() => {
                expect(Ajax.put).toHaveBeenCalled();
                const messageAction = store
                    .getActions()
                    .find((a) => a.type === ActionType.PUBLISH_MESSAGE);
                expect(messageAction).toBeDefined();
                expect(messageAction.message.type).toEqual(MessageType.SUCCESS);
            });
        });

        // Bug #1449
        it("handles multilingual term label by showing localized label when publishing success message", () => {
            Ajax.put = jest.fn().mockResolvedValue(null);
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    setTermDefinitionSource(definitionSource, term)
                )
            ).then(() => {
                expect(Ajax.put).toHaveBeenCalled();
                const messageAction = store
                    .getActions()
                    .find((a) => a.type === ActionType.PUBLISH_MESSAGE);
                expect(messageAction).toBeDefined();
                expect(messageAction.message.values.term).toEqual(
                    term.label[Constants.DEFAULT_LANGUAGE]
                );
            });
        });

        it("publishes error message when server responds with CONFLICT", () => {
            Ajax.put = jest.fn().mockRejectedValue({ status: 409 });
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    setTermDefinitionSource(definitionSource, term)
                )
            ).catch(() => {
                expect(Ajax.put).toHaveBeenCalled();
                const messageAction = store
                    .getActions()
                    .find((a) => a.type === ActionType.PUBLISH_MESSAGE);
                expect(messageAction).toBeDefined();
                expect(messageAction.message.type).toEqual(MessageType.ERROR);
            });
        });

        // Bug #1449
        it("handles multilingual term label by showing localized label when publishing error message", () => {
            Ajax.put = jest.fn().mockRejectedValue({ status: 409 });
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    setTermDefinitionSource(definitionSource, term)
                )
            ).catch(() => {
                expect(Ajax.put).toHaveBeenCalled();
                const messageAction = store
                    .getActions()
                    .find((a) => a.type === ActionType.PUBLISH_MESSAGE);
                expect(messageAction).toBeDefined();
                expect(messageAction.message.values.term).toEqual(
                    term.label[Constants.DEFAULT_LANGUAGE]
                );
            });
        });
    });

    describe("setTermStatus", () => {
        const termIri = VocabularyUtils.create(`${namespace}${vocabularyName}/terms/${termName}`);

        it("sends PUT request with new term status to REST endpoint", () => {
            Ajax.put = jest.fn().mockResolvedValue(null);
            return Promise.resolve((store.dispatch as ThunkDispatch)(setTermStatus(termIri, TermStatus.CONFIRMED))).then(() => {
                expect(Ajax.put).toHaveBeenCalled();
                expect((Ajax.put as jest.Mock).mock.calls[0][1].getContent()).toEqual(TermStatus.CONFIRMED);
            });
        });

        it("publishes success action with new status as payload on success", () => {
            Ajax.put = jest.fn().mockResolvedValue(null);
            const status = TermStatus.CONFIRMED;
            return Promise.resolve((store.dispatch as ThunkDispatch)(setTermStatus(termIri, status))).then(() => {
                expect(Ajax.put).toHaveBeenCalled();
                const successAction = store.getActions().find(a => a.type === ActionType.SET_TERM_STATUS && a.status === AsyncActionStatus.SUCCESS);
                expect(successAction).toBeDefined();
                expect(successAction.payload).toEqual(status);
            });
        });
    });

    describe("loadTermsFromWorkspace", () => {
        it("gets all root terms when parent option is not specified", () => {
            const terms = require("../../rest-mock/terms");
            Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermsFromWorkspace({}))).then(() => {
                const targetUri = (Ajax.get as jest.Mock).mock.calls[0][0];
                expect(targetUri).toEqual(Constants.API_PREFIX + "/terms");
                const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
                expect(callConfig.getParams()).toEqual(expect.objectContaining({rootsOnly: true}));
            });
        });

        it("gets subterms when parent option is specified", () => {
            const terms = require("../../rest-mock/terms");
            Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
            const termNamespace = "http://data.iprpraha.cz/zdroj/slovnik/test-vocabulary/term/";
            const fragment = "pojem-3";
            const parentUri = termNamespace + fragment;
            const params: FetchOptionsFunction = {
                optionID: parentUri
            };
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermsFromWorkspace(params))).then(() => {
                const targetUri = (Ajax.get as jest.Mock).mock.calls[0][0];
                expect(targetUri).toEqual(`${Constants.API_PREFIX}/terms/${fragment}/subterms`);
                const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
                expect(callConfig.getParams()).toEqual(expect.objectContaining({namespace: termNamespace}));
            });
        });

        it("specifies correct paging params for offset and limit", () => {
            const terms = require("../../rest-mock/terms");
            Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
            const params: FetchOptionsFunction = {
                offset: 88,
                limit: 100
            };
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermsFromWorkspace(params))).then(() => {
                const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
                expect(callConfig.getParams()).toEqual(expect.objectContaining({page: 1, size: 100, rootsOnly: true}));
            });
        });

        it("specifies search string when search string option is provided", () => {
            const searchString = "label";
            const terms = require("../../rest-mock/terms");
            Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermsFromWorkspace({searchString}))).then(() => {
                const targetUri = (Ajax.get as jest.Mock).mock.calls[0][0];
                expect(targetUri).toEqual(Constants.API_PREFIX + "/terms");
                const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
                expect(callConfig.getParams()).toEqual(expect.objectContaining({rootsOnly: false, searchString}));
            });
        });
    });

    describe("loadTermsIncludingCanonical", () => {
        it("passes includeCanonical parameter to endpoint call", () => {
            const terms = require("../../rest-mock/terms");
            Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermsIncludingCanonical({}))).then(() => {
                const targetUri = (Ajax.get as jest.Mock).mock.calls[0][0];
                expect(targetUri).toEqual(Constants.API_PREFIX + "/terms");
                const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
                expect(callConfig.getParams().includeCanonical).toBeTruthy();
            });
        });

        it("supports using search string and canonical terms inclusion in the same request", () => {
            const searchString = "label";
            const terms = require("../../rest-mock/terms");
            Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermsIncludingCanonical({searchString}))).then(() => {
                const targetUri = (Ajax.get as jest.Mock).mock.calls[0][0];
                expect(targetUri).toEqual(Constants.API_PREFIX + "/terms");
                const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
                expect(callConfig.getParams()).toEqual(expect.objectContaining({searchString, includeCanonical: true}));
            });
        });
    });
});
