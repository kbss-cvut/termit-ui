import * as React from "react";
import Asset from "../../../../model/Asset";
import {shallow} from "enzyme";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import {InjectsLoading} from "../../../hoc/withInjectableLoading";
import {MyAssets} from "../MyAssets";

describe("LastEditedAssets", () => {
    let onLoad: () => Promise<Asset[]>;

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
        onLoad = jest.fn().mockImplementation(() => Promise.resolve([]));
    });

    it("loads my assets on mount", () => {
        shallow(<MyAssets
            loadAssets={onLoad} {...loadingInjectMock} {...intlFunctions()}/>);
        expect(onLoad).toHaveBeenCalled();
    });
});
