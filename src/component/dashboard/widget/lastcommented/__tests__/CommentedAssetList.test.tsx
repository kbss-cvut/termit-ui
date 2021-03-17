import * as React from "react";
import {mountWithIntl} from "../../../../../__tests__/environment/Environment";
import en from "../../../../../i18n/en";
import Generator from "../../../../../__tests__/environment/Generator";
import {MemoryRouter} from "react-router-dom";
import User from "../../../../../model/User";
import {intlFunctions} from "../../../../../__tests__/environment/IntlUtil";
import {CommentedAssetList} from "../CommentedAssetList";

describe("CommentedAssetList", () => {
    let user: User;

    beforeEach(() => {
        user = Generator.generateUser();
    });

    it("does not render info message during loading", () => {
        const wrapper = mountWithIntl(<MemoryRouter>
            <CommentedAssetList user={user} commentedAssets={[]} loading={true} {...intlFunctions()}/>
        </MemoryRouter>);
        const info = wrapper.find(".italics");
        expect(info.exists()).toBeFalsy();
    });

    it("renders info message when no assets were found", () => {
        const wrapper = mountWithIntl(<MemoryRouter>
            <CommentedAssetList user={user} commentedAssets={[]} loading={false} {...intlFunctions()}/>
        </MemoryRouter>);
        const info = wrapper.find(".italics");
        expect(info.exists()).toBeTruthy();
        expect(info.text()).toEqual(en.messages["dashboard.widget.commentList.empty"]);
    });
});
