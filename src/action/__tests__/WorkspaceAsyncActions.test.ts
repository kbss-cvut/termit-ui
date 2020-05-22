import configureMockStore, {MockStoreEnhanced} from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import VocabularyUtils from "../../util/VocabularyUtils";
import Ajax from "../../util/Ajax";
import {ThunkDispatch} from "../../util/Types";
import {selectWorkspace} from "../WorkspaceAsyncActions";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => ({
    default: jest.fn(),
    content: jest.requireActual("../../util/Ajax").content,
    params: jest.requireActual("../../util/Ajax").params,
    param: jest.requireActual("../../util/Ajax").param,
    accept: jest.requireActual("../../util/Ajax").accept,
    contentType: jest.requireActual("../../util/Ajax").contentType,
    formData: jest.requireActual("../../util/Ajax").formData
}));

const mockStore = configureMockStore<TermItState>([thunk]);

describe("WorkspaceAsyncActions", () => {

    let store: MockStoreEnhanced<TermItState>;

    beforeEach(() => {
        jest.clearAllMocks();
        store = mockStore(new TermItState());
    });

    describe("selectWorkspace", () => {
        it("sends request for selecting workspace to server API", () => {
            const fragment = "test-workspace";
            const iri = VocabularyUtils.create(`${VocabularyUtils.NS_TERMIT}${fragment}`);
            Ajax.put = jest.fn().mockResolvedValue({});
            return Promise.resolve((store.dispatch as ThunkDispatch)(selectWorkspace(iri))).then(() => {
                expect(Ajax.put).toHaveBeenCalled();
                const url = (Ajax.put as jest.Mock).mock.calls[0][0];
                expect(url).toContain(`/workspaces/${fragment}`);
                const config = (Ajax.put as jest.Mock).mock.calls[0][1];
                expect(config.getParams().namespace).toEqual(VocabularyUtils.NS_TERMIT);
            });
        });
    });
});
