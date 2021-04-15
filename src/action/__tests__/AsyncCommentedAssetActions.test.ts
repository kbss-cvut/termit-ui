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
    loadMyLastCommented,
} from "../AsyncCommentedAssetActions";
import RecentlyCommentedAsset from "../../model/RecentlyCommentedAsset";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => {
    const originalModule = jest.requireActual("../../util/Ajax");
    return {
        ...originalModule,
        default: jest.fn(),
    };
});

const mockStore = configureMockStore<TermItState>([thunk]);

describe("Async commented asset actions", () => {
    let store: MockStoreEnhanced<TermItState>;

    const data = [
        {
            "@id": Generator.generateUri(),
            "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/je-tématem": {
                "@id": Generator.generateUri(),
            },
            "@type": [VocabularyUtils.TERM],
        },
        {
            "@id": Generator.generateUri(),
            "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/je-tématem": {
                "@id": Generator.generateUri(),
            },
            "@type": [VocabularyUtils.TERM],
        },
        {
            "@id": Generator.generateUri(),
            "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/je-tématem": {
                "@id": Generator.generateUri(),
            },
            "@type": [VocabularyUtils.TERM],
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        store = mockStore(new TermItState());
    });

    describe("load last commented assets", () => {
        it("returns correct instances of received last commented asset data", () => {
            Ajax.get = jest
                .fn()
                .mockImplementation(() => Promise.resolve(data));
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(loadLastCommentedAssets())
            ).then((result: RecentlyCommentedAsset[]) => {
                expect(Ajax.get).toHaveBeenCalledWith(
                    Constants.API_PREFIX + "/assets/last-commented",
                    param("limit", "5")
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
            Ajax.get = jest
                .fn()
                .mockImplementation(() => Promise.resolve(data));
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(loadMyLastCommented())
            ).then((result: RecentlyCommentedAsset[]) => {
                expect(Ajax.get).toHaveBeenCalledWith(
                    Constants.API_PREFIX + "/assets/my-last-commented",
                    param("limit", "5")
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
            Ajax.get = jest
                .fn()
                .mockImplementation(() => Promise.resolve(data));
            return Promise.resolve(
                (store.dispatch as ThunkDispatch)(
                    loadLastCommentedInReactionToMine()
                )
            ).then((result: RecentlyCommentedAsset[]) => {
                expect(Ajax.get).toHaveBeenCalledWith(
                    Constants.API_PREFIX +
                        "/assets/last-commented-in-reaction-to-mine",
                    param("limit", "5")
                );
                expect(result.length).toEqual(data.length);
                result.forEach((r) =>
                    expect(r).toBeInstanceOf(RecentlyCommentedAsset)
                );
            });
        });
    });
});
