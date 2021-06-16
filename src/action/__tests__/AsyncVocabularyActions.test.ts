import configureMockStore, {MockStoreEnhanced} from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import VocabularyUtils from "../../util/VocabularyUtils";
import Ajax from "../../util/Ajax";
import Constants from "../../util/Constants";
import Generator from "../../__tests__/environment/Generator";
import {ThunkDispatch} from "../../util/Types";
import ActionType from "../ActionType";
import {loadTermCount} from "../AsyncVocabularyActions";
import AsyncActionStatus from "../AsyncActionStatus";

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

    let store: MockStoreEnhanced<TermItState>;

    beforeEach(() => {
        jest.clearAllMocks();
        store = mockStore(new TermItState());
    });

    describe("loadTermCount", () => {
        it("extracts term count from response header", () => {
            const count = Generator.randomInt(0, 100);
            const countHeader = {};
            countHeader[Constants.Headers.X_TOTAL_COUNT] = count.toString();
            Ajax.head = jest.fn().mockResolvedValue({
                data: {},
                headers: countHeader
            });
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    loadTermCount(VocabularyUtils.create(vocabularyName + namespace))
                )
            ).then(() => {
                expect(Ajax.head).toHaveBeenCalled();
                const resultAction = store.getActions().find((a) => a.type === ActionType.LOAD_TERM_COUNT && a.status === AsyncActionStatus.SUCCESS);
                expect(resultAction).toBeDefined();
                expect(resultAction.payload).toEqual(count);
            });
        });

        it("handles situations when response does not contain corresponding header", () => {
            Ajax.head = jest.fn().mockResolvedValue({
                headers: {}
            });
            return Promise.resolve((store.dispatch as ThunkDispatch)(loadTermCount(VocabularyUtils.create(vocabularyName + namespace))))
                .then(() => {
                expect(Ajax.head).toHaveBeenCalled();
                const resultAction = store.getActions().find((a) => a.type === ActionType.LOAD_TERM_COUNT && a.status === AsyncActionStatus.FAILURE);
                expect(resultAction).toBeDefined();
                const error = resultAction.error;
                expect(error.message).toEqual(`'${Constants.Headers.X_TOTAL_COUNT}' header missing in server response.`);
            });
        });
    });
});