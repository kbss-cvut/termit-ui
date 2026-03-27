import configureMockStore, {MockStoreEnhanced} from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import Ajax from "../../util/Ajax";
import {ThunkDispatch} from "../../util/Types";
import {loadAllTerms, loadTermByIri} from "../AsyncAnnotatorActions";
import ActionType from "../ActionType";
import AsyncActionStatus from "../AsyncActionStatus";
import Term from "../../model/Term";
import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../../util/VocabularyUtils";
import type {Mock} from "vitest";
import {vi} from "vitest";

vi.mock("../../util/Routing");
vi.mock(import("../../util/Ajax"), async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        default: {
            get: vi.fn(),
        } as any
    };
});

// Mock implementation for throwIfAborted which is missing in jsdom < 22.1.0
AbortSignal.prototype.throwIfAborted = function () {
    if (this.aborted) {
        throw this.reason;
    }
};

const mockStore = configureMockStore<TermItState>([thunk]);

describe("AsyncAnnotatorActions", () => {
    const vocabularyName = "test-vocabulary";

    let store: MockStoreEnhanced<TermItState>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = mockStore(new TermItState());
    });

    describe("loadTermTerms", () => {
        it("provides includeImported with request when specified", () => {
            const terms = require("../../rest-mock/terms");
            Ajax.get = vi.fn().mockResolvedValue(terms);
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    loadAllTerms({fragment: vocabularyName}, true)
                )
            ).then(() => {
                const callConfig = (Ajax.get as Mock).mock.calls[0][1];
                expect(callConfig.getParams().includeImported).toBeTruthy();
            });
        });

        it("does not invoke Ajax when a request is already pending", () => {
            store.getState().pendingActions[ActionType.ANNOTATOR_LOAD_TERMS] = {
                status: AsyncActionStatus.REQUEST,
            };
            const terms = require("../../rest-mock/terms");
            Ajax.get = vi.fn().mockResolvedValue(terms);
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    loadAllTerms({fragment: vocabularyName}, true)
                )
            ).then(() => {
                expect(Ajax.get).not.toHaveBeenCalled();
            });
        });
    });

    describe("loadTermByIri", () => {
        it("loads required term and returns it", () => {
            const term = require("../../rest-mock/terms")[0];
            Ajax.get = vi.fn().mockResolvedValue(term);
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(loadTermByIri(term["@id"]))
            ).then((result: Term | null) => {
                expect(Ajax.get).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).not.toBeNull();
                expect(result!.iri).toEqual(term["@id"]);
            });
        });

        it("returns cached term when it is available", () => {
            const term = Generator.generateTerm();
            store.getState().annotatorTerms[term.iri] = term;
            Ajax.get = vi.fn().mockResolvedValue({});
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(loadTermByIri(term.iri))
            ).then((result: Term | null) => {
                expect(Ajax.get).not.toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).not.toBeNull();
                expect(result).toEqual(term);
            });
        });

        it("does not trigger success action when result is null", () => {
            Ajax.get = vi.fn().mockRejectedValue({status: 404});
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    loadTermByIri(Generator.generateUri())
                )
            ).then(() => {
                expect(Ajax.get).toHaveBeenCalled();
                const successAction = store
                    .getActions()
                    .find(
                        (a) =>
                            a.type === ActionType.ANNOTATOR_LOAD_TERM &&
                            a.status === AsyncActionStatus.SUCCESS
                    );
                expect(successAction).not.toBeDefined();
            });
        });

        // Terms loaded for annotator by IRI are not from the vocabulary associated with the file
        // Since there is no additional term fetching available for such terms, it is not possible to load
        // subterms. Therefore, we will just keep them as a flat list with no hierarchical structure
        it("removes child term references of loaded term", () => {
            const term = require("../../rest-mock/terms")[0];
            term[VocabularyUtils.SKOS_NARROWER] = [
                {
                    "@id": Generator.generateUri(),
                    label: "Child one",
                },
            ];
            Ajax.get = vi.fn().mockResolvedValue(term);
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(loadTermByIri(term["@id"]))
            ).then((result: Term | null) => {
                expect(Ajax.get).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).not.toBeNull();
                expect(result!.iri).toEqual(term["@id"]);
                expect(result!.subTerms).toEqual([]);
            });
        });
    });
});
