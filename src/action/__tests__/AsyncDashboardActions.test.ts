import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import Constants from "../../util/Constants";
import Ajax, { param } from "../../util/Ajax";
import thunk from "redux-thunk";
import VocabularyUtils from "../../util/VocabularyUtils";
import Generator from "../../__tests__/environment/Generator";
import { ThunkDispatch } from "../../util/Types";
import TermItState from "../../model/TermItState";
import {
  loadLastCommentedAssets,
  loadLastCommentedInReactionToMine,
  loadLastEditedAssets,
  loadMyAssets,
  loadMyLastCommented,
} from "../AsyncDashboardActions";
import RecentlyCommentedAsset from "../../model/RecentlyCommentedAsset";
import RecentlyModifiedAsset from "../../model/RecentlyModifiedAsset";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => {
  const originalModule = jest.requireActual("../../util/Ajax");
  return {
    ...originalModule,
    default: jest.fn(),
  };
});

const mockStore = configureMockStore<TermItState>([thunk]);

describe("AsyncDashboardActions", () => {
  let store: MockStoreEnhanced<TermItState>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(new TermItState());
  });

  describe("loadLastEditedAssets", () => {
    it("returns correct instances of received asset data", () => {
      const data = [
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test file",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test vocabulary",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.VOCABULARY],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2004/02/skos/core#prefLabel": "Test term",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
            {
              "@id": Generator.generateUri(),
            },
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.TERM],
        },
      ];
      const page = Generator.randomInt(0, 5);
      const pageSize = 10;
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadLastEditedAssets(page, pageSize))
      ).then((result: RecentlyModifiedAsset[]) => {
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX + "/assets/last-edited",
          param("size", pageSize.toString()).param("page", page.toString())
        );
        expect(result.length).toEqual(data.length);
        result.forEach((r) => expect(r).toBeInstanceOf(RecentlyModifiedAsset));
      });
    });

    it("handles correctly label of terms being skos:prefLabel instead of rdsf:label", () => {
      const data = [
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2004/02/skos/core#prefLabel": "Test term",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
            {
              "@id": Generator.generateUri(),
            },
          "http://www.w3.org/2004/02/skos/core#broader": [
            {
              "@id": Generator.generateUri(),
              "http://www.w3.org/2004/02/skos/core#prefLabel":
                "Test parent one",
              "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
                {
                  "@id": Generator.generateUri(),
                },
              "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
              "http://purl.org/dc/terms/modified": Date.now(),
              "@type": [VocabularyUtils.TERM],
            },
            {
              "@id": Generator.generateUri(),
              "http://www.w3.org/2004/02/skos/core#prefLabel":
                "Test parent two",
              "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
                {
                  "@id": Generator.generateUri(),
                },
              "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
              "http://purl.org/dc/terms/modified": Date.now(),
              "@type": [VocabularyUtils.TERM],
            },
          ],
          "@type": [VocabularyUtils.TERM],
        },
      ];
      const page = Generator.randomInt(0, 5);
      const pageSize = 10;
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadLastEditedAssets(page, pageSize))
      ).then((result: RecentlyModifiedAsset[]) => {
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX + "/assets/last-edited",
          param("size", pageSize.toString()).param("page", page.toString())
        );
        result.forEach((r) => expect(r).toBeInstanceOf(RecentlyModifiedAsset));
      });
    });
  });

  describe("loadMyAssets", () => {
    it("returns correct instances of received asset data", () => {
      const data = [
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test file",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test vocabulary",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.VOCABULARY],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test term",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
            {
              "@id": Generator.generateUri(),
            },
          "@type": [VocabularyUtils.TERM],
        },
      ];
      const page = Generator.randomInt(0, 5);
      const pageSize = 10;
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadMyAssets(page, pageSize))
      ).then((result: RecentlyModifiedAsset[]) => {
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX + "/assets/last-edited",
          param("forCurrentUserOnly", "true")
            .param("size", pageSize.toString())
            .param("page", page.toString())
        );
        expect(result.length).toEqual(data.length);
        result.forEach((r) => expect(r).toBeInstanceOf(RecentlyModifiedAsset));
      });
    });

    it("correctly handles labels of vocabularies and resources and pref label of terms", () => {
      const vocLabel = "Test vocabulary";
      const termLabel = "Test term";
      const data = [
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": vocLabel,
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.VOCABULARY],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": termLabel,
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
            {
              "@id": Generator.generateUri(),
            },
          "@type": [VocabularyUtils.TERM],
        },
      ];
      const page = Generator.randomInt(0, 5);
      const pageSize = 10;
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadMyAssets(page, pageSize))
      ).then((result: RecentlyModifiedAsset[]) => {
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX + "/assets/last-edited",
          param("forCurrentUserOnly", "true")
            .param("size", pageSize.toString())
            .param("page", page.toString())
        );
        expect(result.length).toEqual(data.length);
        expect(result[0].label).toEqual(vocLabel);
        expect(result[1].label).toEqual(termLabel);
      });
    });
  });

  describe("Async commented asset actions", () => {
    const data = [
      {
        "@id": Generator.generateUri(),
        "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/je-tématem":
          {
            "@id": Generator.generateUri(),
          },
        "@type": [VocabularyUtils.TERM],
      },
      {
        "@id": Generator.generateUri(),
        "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/je-tématem":
          {
            "@id": Generator.generateUri(),
          },
        "@type": [VocabularyUtils.TERM],
      },
      {
        "@id": Generator.generateUri(),
        "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/je-tématem":
          {
            "@id": Generator.generateUri(),
          },
        "@type": [VocabularyUtils.TERM],
      },
    ];

    describe("load last commented assets", () => {
      it("returns correct instances of received last commented asset data", () => {
        const page = Generator.randomInt(0, 5);
        const size = 5;
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
        return Promise.resolve(
          (store.dispatch as ThunkDispatch)(loadLastCommentedAssets(page, size))
        ).then((result: RecentlyCommentedAsset[]) => {
          expect(Ajax.get).toHaveBeenCalledWith(
            Constants.API_PREFIX + "/assets/last-commented",
            param("size", size.toString()).param("page", page.toString())
          );
          expect(result.length).toEqual(data.length);
          result.forEach((r) =>
            expect(r).toBeInstanceOf(RecentlyCommentedAsset)
          );
        });
      });
    });

    describe("load my last commented assets", () => {
      it("returns correct instances of received my last commented asset data", () => {
        const page = Generator.randomInt(0, 5);
        const size = 5;
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
        return Promise.resolve(
          (store.dispatch as ThunkDispatch)(loadMyLastCommented(page, size))
        ).then((result: RecentlyCommentedAsset[]) => {
          expect(Ajax.get).toHaveBeenCalledWith(
            Constants.API_PREFIX + "/assets/my-last-commented",
            param("size", size.toString()).param("page", page.toString())
          );
          expect(result.length).toEqual(data.length);
          result.forEach((r) =>
            expect(r).toBeInstanceOf(RecentlyCommentedAsset)
          );
        });
      });
    });

    describe("load last commented assets in reaction to mine", () => {
      it("returns correct instances of received last commented assets in reaction to mine", () => {
        const page = Generator.randomInt(0, 5);
        const size = 5;
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
        return Promise.resolve(
          (store.dispatch as ThunkDispatch)(
            loadLastCommentedInReactionToMine(page, size)
          )
        ).then((result: RecentlyCommentedAsset[]) => {
          expect(Ajax.get).toHaveBeenCalledWith(
            Constants.API_PREFIX + "/assets/last-commented-in-reaction-to-mine",
            param("size", size.toString()).param("page", page.toString())
          );
          expect(result.length).toEqual(data.length);
          result.forEach((r) =>
            expect(r).toBeInstanceOf(RecentlyCommentedAsset)
          );
        });
      });
    });
  });
});
