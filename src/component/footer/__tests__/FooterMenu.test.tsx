import * as React from "react";
import {FooterMenu} from "../FooterMenu";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {LanguageSelector} from "../../main/LanguageSelector";

describe("FooterMenu", () => {

    it("renders component correctly", () => {
        const wrapper = mountWithIntl(<FooterMenu fixed={true} desktopView={true}
                                                  sidebarExpanded={true} {...intlFunctions()}/>);

        expect(wrapper.find("div").find(LanguageSelector).length).toBe(1);
    });
});
