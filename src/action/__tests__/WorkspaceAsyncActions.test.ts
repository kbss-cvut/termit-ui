import configureMockStore, {MockStoreEnhanced} from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import VocabularyUtils from "../../util/VocabularyUtils";
import Ajax from "../../util/Ajax";
import {ThunkDispatch} from "../../util/Types";
import {selectWorkspace} from "../WorkspaceAsyncActions";
import ActionType from "../ActionType";
import AsyncActionStatus from "../AsyncActionStatus";
import Workspace from "../../model/Workspace";

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

        it("saves returned workspace in application store", () => {
            const fragment = "test-workspace";
            const iri = VocabularyUtils.create(`${VocabularyUtils.NS_TERMIT}${fragment}`);
            const ws = require("../../rest-mock/workspace.json");
            Ajax.put = jest.fn().mockResolvedValue(ws);
            return Promise.resolve((store.dispatch as ThunkDispatch)(selectWorkspace(iri))).then(() => {
                const successAction = store.getActions().find(a => a.type === ActionType.SELECT_WORKSPACE && a.status === AsyncActionStatus.SUCCESS);
                expect(successAction).toBeDefined();
                expect(successAction.payload).toBeDefined();
                expect(successAction.payload.iri).toEqual(ws["@id"]);
                expect(successAction.payload.label).toEqual(ws[VocabularyUtils.DC_TITLE]);
                expect(successAction.payload.description).toEqual(ws[VocabularyUtils.DC_DESCRIPTION]);
            });
        });

        it("does not send request when workspace is already loaded in state", () => {
            const fragment = "test-workspace";
            const iri = VocabularyUtils.create(`${VocabularyUtils.NS_TERMIT}${fragment}`);
            Ajax.put = jest.fn().mockResolvedValue({});
            store.getState().workspace = new Workspace({
                iri: iri.toString(),
                label: "Test ws"
            });
            return Promise.resolve((store.dispatch as ThunkDispatch)(selectWorkspace(iri))).then(() => {
                expect(Ajax.put).not.toHaveBeenCalled();
            });
        });
    });
});
