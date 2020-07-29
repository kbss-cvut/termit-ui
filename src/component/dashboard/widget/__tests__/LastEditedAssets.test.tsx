import * as React from "react";
import {shallow} from "enzyme";
import {LastEditedAssets} from "../LastEditedAssets";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import {mountWithIntl} from "../../../../__tests__/environment/Environment";
import en from "../../../../i18n/en";
import Generator from "../../../../__tests__/environment/Generator";
import {Link, MemoryRouter} from "react-router-dom";
import {InjectsLoading} from "../../../hoc/withInjectableLoading";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import RecentlyModifiedAsset from "../../../../model/RecentlyModifiedAsset";

describe("LastEditedAssets", () => {
    let onLoad: () => Promise<RecentlyModifiedAsset[]>;

    const loadingInjectMock: InjectsLoading = {
        loadingOn(): void {
            // Do nothing,
        },
        loadingOff(): void {
            // Do nothing,
        },
        renderMask(): null {
            return null;
        },
        loading: false
    };

    beforeEach(() => {
        onLoad = jest.fn().mockResolvedValue([]);
    });

    it("loads last edited assets on mount", () => {
        shallow(<LastEditedAssets
            loadAssets={onLoad} {...loadingInjectMock} {...intlFunctions()}/>);
        expect(onLoad).toHaveBeenCalled();
    });

    it("renders info message when no assets were found", () => {
        const wrapper = mountWithIntl(<MemoryRouter>
            <LastEditedAssets loadAssets={onLoad} {...loadingInjectMock} {...intlFunctions()}/>
        </MemoryRouter>);
        return Promise.resolve().then(() => {
            wrapper.update();
            const info = wrapper.find(".italics");
            expect(info.exists()).toBeTruthy();
            expect(info.text()).toEqual(en.messages["dashboard.widget.assetList.empty"]);
        });
    });

    it("renders downloaded assets", () => {
        const assets = [new RecentlyModifiedAsset({
            iri: Generator.generateUri(),
            label: "Term",
            types: [VocabularyUtils.TERM],
            vocabulary: {iri: Generator.generateUri()},
            editor: Generator.generateUser(),
            modified: Date.now()
        }), new RecentlyModifiedAsset({
            iri: Generator.generateUri(),
            label: "Vocabulary",
            types: [VocabularyUtils.VOCABULARY],
            editor: Generator.generateUser(),
            modified: Date.now()
        })];
        onLoad = jest.fn().mockImplementation(() => Promise.resolve(assets));
        const wrapper = mountWithIntl(<MemoryRouter>
            <LastEditedAssets loadAssets={onLoad} {...loadingInjectMock} {...intlFunctions()}/>
        </MemoryRouter>);
        return Promise.resolve().then(() => {
            wrapper.update();
            const links = wrapper.find(Link);
            expect(links.length).toEqual(2);
            expect(links.at(0).text()).toEqual(assets[0].label);
            expect(links.at(1).text()).toEqual(assets[1].label);
        });
    });
});
