import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import VocabularyUtils from "../../util/VocabularyUtils";
import Ajax from "../../util/Ajax";
import Constants from "../../util/Constants";
import Generator from "../../__tests__/environment/Generator";
import { ThunkDispatch } from "../../util/Types";
import ActionType from "../ActionType";
import {
  exportGlossary,
  exportGlossaryWithExactMatchReferences,
  loadTermCount,
  loadVocabularyContentChanges,
  loadVocabularySnapshots,
} from "../AsyncVocabularyActions";
import AsyncActionStatus from "../AsyncActionStatus";
import ExportType from "../../util/ExportType";
import Utils from "../../util/Utils";

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
        headers: countHeader,
      });
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadTermCount(VocabularyUtils.create(vocabularyName + namespace))
        )
      ).then(() => {
        expect(Ajax.head).toHaveBeenCalled();
        const resultAction = store
          .getActions()
          .find(
            (a) =>
              a.type === ActionType.LOAD_TERM_COUNT &&
              a.status === AsyncActionStatus.SUCCESS
          );
        expect(resultAction).toBeDefined();
        expect(resultAction.payload).toEqual(count);
      });
    });

    it("handles situations when response does not contain corresponding header", () => {
      Ajax.head = jest.fn().mockResolvedValue({
        headers: {},
      });
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadTermCount(VocabularyUtils.create(vocabularyName + namespace))
        )
      ).then(() => {
        expect(Ajax.head).toHaveBeenCalled();
        const resultAction = store
          .getActions()
          .find(
            (a) =>
              a.type === ActionType.LOAD_TERM_COUNT &&
              a.status === AsyncActionStatus.FAILURE
          );
        expect(resultAction).toBeDefined();
        const error = resultAction.error;
        expect(error.message).toEqual(
          `'${Constants.Headers.X_TOTAL_COUNT}' header missing in server response.`
        );
      });
    });
  });

  describe("exportGlossary", () => {
    it("provides vocabulary normalized name and namespace in request", () => {
      const namespace =
        "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
      const name = "test-vocabulary";
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: "test",
          headers: { "Content-type": ExportType.CSV.mimeType },
        })
      );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          exportGlossary(
            {
              namespace,
              fragment: name,
            },
            ExportType.CSV
          )
        )
      ).then(() => {
        expect(Ajax.getRaw).toHaveBeenCalled();
        const url = (Ajax.getRaw as jest.Mock).mock.calls[0][0];
        expect(url).toEqual(
          Constants.API_PREFIX + "/vocabularies/" + name + "/terms"
        );
        const config = (Ajax.getRaw as jest.Mock).mock.calls[0][1];
        expect(config.getParams().namespace).toEqual(namespace);
      });
    });

    it("passes additional parameters as query parameters when specified", () => {
      const name = "test-vocabulary";
      const qParams = {
        withReferences: true,
        property: [Generator.generateUri(), Generator.generateUri()],
      };
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: "test",
          headers: { "Content-type": ExportType.Turtle.mimeType },
        })
      );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          exportGlossary(
            {
              namespace,
              fragment: name,
            },
            ExportType.Turtle,
            qParams
          )
        )
      ).then(() => {
        expect(Ajax.getRaw).toHaveBeenCalled();
        const url = (Ajax.getRaw as jest.Mock).mock.calls[0][0];
        expect(url).toEqual(
          Constants.API_PREFIX + "/vocabularies/" + name + "/terms"
        );
        const config = (Ajax.getRaw as jest.Mock).mock.calls[0][1];
        expect(config.getParams().namespace).toEqual(namespace);
        Object.getOwnPropertyNames((p: string) =>
          expect(config.getParams()[p]).toEqual(qParams[p])
        );
      });
    });

    it("sets accept type to CSV when CSV export type is provided", () => {
      const iri = VocabularyUtils.create(Generator.generateUri());
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: "test",
          headers: { "Content-type": ExportType.CSV.mimeType },
        })
      );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(exportGlossary(iri, ExportType.CSV))
      ).then(() => {
        expect(Ajax.getRaw).toHaveBeenCalled();
        const config = (Ajax.getRaw as jest.Mock).mock.calls[0][1];
        expect(config.getHeaders()[Constants.Headers.ACCEPT]).toEqual(
          Constants.CSV_MIME_TYPE
        );
      });
    });

    it("sets accept type to Excel when Excel export type is provided", () => {
      const iri = VocabularyUtils.create(Generator.generateUri());
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: "test",
          headers: { "Content-type": Constants.EXCEL_MIME_TYPE },
        })
      );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(exportGlossary(iri, ExportType.Excel))
      ).then(() => {
        expect(Ajax.getRaw).toHaveBeenCalled();
        const config = (Ajax.getRaw as jest.Mock).mock.calls[0][1];
        expect(config.getHeaders()[Constants.Headers.ACCEPT]).toEqual(
          Constants.EXCEL_MIME_TYPE
        );
      });
    });

    it("invokes file save on request success", () => {
      const iri = VocabularyUtils.create(Generator.generateUri());
      const data = "test";
      const fileName = "test.csv";
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data,
          headers: {
            "content-type": Constants.CSV_MIME_TYPE,
            "content-disposition": 'attachment; filename="' + fileName + '"',
          },
        })
      );
      Utils.fileDownload = jest.fn();
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(exportGlossary(iri, ExportType.CSV))
      ).then(() => {
        expect(Utils.fileDownload).toHaveBeenCalledWith(
          data,
          fileName,
          Constants.CSV_MIME_TYPE
        );
      });
    });

    it("dispatches async success on request success and correct data", () => {
      const iri = VocabularyUtils.create(Generator.generateUri());
      const data = "test";
      const fileName = "test.csv";
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data,
          headers: {
            "content-type": Constants.CSV_MIME_TYPE,
            "content-disposition": 'attachment; filename="' + fileName + '"',
          },
        })
      );
      Utils.fileDownload = jest.fn();
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(exportGlossary(iri, ExportType.CSV))
      ).then(() => {
        expect(store.getActions().length).toEqual(2);
        const successAction = store.getActions()[1];
        expect(successAction.type).toEqual(ActionType.EXPORT_GLOSSARY);
        expect(successAction.status).toEqual(AsyncActionStatus.SUCCESS);
      });
    });

    it("dispatches failure when response does not contain correct data", () => {
      const iri = VocabularyUtils.create(Generator.generateUri());
      const data = "test";
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data,
          headers: {
            "content-type": Constants.CSV_MIME_TYPE,
          },
        })
      );
      Utils.fileDownload = jest.fn();
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(exportGlossary(iri, ExportType.CSV))
      ).then(() => {
        expect(store.getActions().length).toEqual(3);
        const successAction = store.getActions()[1];
        expect(successAction.type).toEqual(ActionType.EXPORT_GLOSSARY);
        expect(successAction.status).toEqual(AsyncActionStatus.FAILURE);
      });
    });
  });

  describe("exportGlossaryWithExactMatchReferences", () => {
    it("exports terms using skos:exactMatch as reference property", () => {
      const name = "test-vocabulary";
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: "test",
          headers: { "Content-type": ExportType.Turtle.mimeType },
        })
      );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          exportGlossaryWithExactMatchReferences({
            namespace,
            fragment: name,
          })
        )
      ).then(() => {
        expect(Ajax.getRaw).toHaveBeenCalled();
        const url = (Ajax.getRaw as jest.Mock).mock.calls[0][0];
        expect(url).toEqual(
          Constants.API_PREFIX + "/vocabularies/" + name + "/terms"
        );
        const config = (Ajax.getRaw as jest.Mock).mock.calls[0][1];
        expect(config.getParams().namespace).toEqual(namespace);
        expect(config.getParams().withReferences).toBeTruthy();
        expect(config.getParams().property).toEqual([
          VocabularyUtils.SKOS_EXACT_MATCH,
        ]);
      });
    });
  });

  describe("loadVocabularyContentChanges", () => {
    it("loads term changes for vocabulary", () => {
      Ajax.get = jest.fn().mockResolvedValue({});
      const vocabulary = Generator.generateVocabulary();
      vocabulary.iri = namespace + vocabularyName;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadVocabularyContentChanges(VocabularyUtils.create(vocabulary.iri))
        )
      ).then(() => {
        expect(Ajax.get).toHaveBeenCalled();
        const args = (Ajax.get as jest.Mock).mock.calls[0];
        expect(args[0]).toEqual(
          `${Constants.API_PREFIX}/vocabularies/${vocabularyName}/history-of-content`
        );
        expect(args[1].getParams().namespace).toEqual(namespace);
      });
    });
  });

  describe("loadVocabularySnapshots", () => {
    it("immediately returns empty array when vocabulary IRI is empty", () => {
      Ajax.get = jest.fn().mockResolvedValue([]);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadVocabularySnapshots(
            VocabularyUtils.create(Constants.EMPTY_ASSET_IRI)
          )
        )
      ).then((res) => {
        expect(res.length).toEqual(0);
        expect(Ajax.get).not.toHaveBeenCalled();
      });
    });
  });
});
