import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import VocabularyUtils from "../../util/VocabularyUtils";
import Utils from "../../util/Utils";
import { ThunkDispatch } from "../../util/Types";
import Constants from "../../util/Constants";
import Ajax from "../../util/Ajax";
import { exportFileContent } from "../AsyncResourceActions";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => {
  const originalModule = jest.requireActual("../../util/Ajax");
  return {
    ...originalModule,
    default: jest.fn(),
  };
});

const mockStore = configureMockStore<TermItState>([thunk]);

describe("AsyncResourceActions", () => {
  let store: MockStoreEnhanced<TermItState>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(new TermItState());
  });

  describe("exportFileContent", () => {
    const fileName = "test-file.html";
    const fileIri = VocabularyUtils.create(
      "http://onto.fel.cvut.cz/ontologies/termit/resources/" + fileName
    );

    it("sends request asking for content as attachment", () => {
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: "test",
          headers: {
            "content-type": "text/html",
            "content-disposition": 'attachment; filename="' + fileName + '"',
          },
        })
      );
      Utils.fileDownload = jest.fn();
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(exportFileContent(fileIri))
      ).then(() => {
        expect(Ajax.getRaw).toHaveBeenCalled();
        const url = (Ajax.getRaw as jest.Mock).mock.calls[0][0];
        expect(url).toEqual(
          Constants.API_PREFIX + "/resources/" + fileName + "/content"
        );
        const config = (Ajax.getRaw as jest.Mock).mock.calls[0][1];
        expect(config.getParams().attachment).toEqual("true");
        expect(config.getParams().namespace).toEqual(fileIri.namespace);
      });
    });

    it("stores response attachment", () => {
      const data = '<html lang="en">test</html>';
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data,
          headers: {
            "content-type": "text/html",
            "content-disposition": 'attachment; filename="' + fileName + '"',
          },
        })
      );
      Utils.fileDownload = jest.fn();
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(exportFileContent(fileIri))
      ).then(() => {
        expect(Utils.fileDownload).toHaveBeenCalled();
        const args = (Utils.fileDownload as jest.Mock).mock.calls[0];
        expect(args[0]).toEqual(data);
        expect(args[1]).toEqual(fileName);
        expect(args[2]).toEqual("text/html");
      });
    });
  });
});
