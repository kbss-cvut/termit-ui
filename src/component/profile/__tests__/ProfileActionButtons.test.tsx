import * as React from "react";

import {ProfileActionButtons} from "../ProfileActionButtons";
import {Button, ButtonToolbar} from "reactstrap";
import {GoKey, GoPencil} from "react-icons/go";
import {shallow} from "enzyme";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";

describe("ProfileActionButtons", () => {

    let showProfileEdit: () => void;
    let navigateToChangePasswordRoute: () => void;
    let edit: boolean;

    beforeEach(() => {
        showProfileEdit = jest.fn();
        navigateToChangePasswordRoute = jest.fn();
        edit = false;
    });

    it("correctly renders component if !edit", () => {
        const wrapper = shallow(<ProfileActionButtons
            edit={edit}
            showProfileEdit={showProfileEdit}
            navigateToChangePasswordRoute={navigateToChangePasswordRoute}
            {...intlFunctions()}
        />);
        const buttonToolbar = wrapper.find(ButtonToolbar);
        const buttons = buttonToolbar.find(Button);
        const buttonEditLabel = buttonToolbar.find(Button).findWhere(b => b.key() === "profile.edit").find(GoPencil);
        const buttonChangePasswordLabel = buttonToolbar.find(Button).findWhere(b => b.key() === "profile.change.password").find(GoKey);

        // expect(buttonToolbar.length).toEqual(1);
        expect(buttons.length).toEqual(2);
        expect(buttonEditLabel.length).toEqual(1);
        expect(buttonChangePasswordLabel.length).toEqual(1);
    });

    it("correctly renders component if edit", () => {
        const wrapper = shallow(<ProfileActionButtons
            edit={true}
            showProfileEdit={showProfileEdit}
            navigateToChangePasswordRoute={navigateToChangePasswordRoute}
            {...intlFunctions()}/>);

        const buttonToolbar = wrapper.find(ButtonToolbar);
        const buttons = buttonToolbar.find(Button);

        expect(buttonToolbar.length).toEqual(1);
        expect(buttons.length).toEqual(0);
    });

    it("calls navigateToChangePassword route on change password button click", () => {
        const wrapper = shallow(<ProfileActionButtons
            edit={edit}
            showProfileEdit={showProfileEdit}
            navigateToChangePasswordRoute={navigateToChangePasswordRoute}
            {...intlFunctions()}
        />);

        wrapper.find(Button).findWhere(b => b.key() === "profile.change.password").simulate("click");
        expect(navigateToChangePasswordRoute).toHaveBeenCalled();
    });

    it("calls showProfileEdit route on edit profile button click", () => {
        const wrapper = shallow(<ProfileActionButtons
            edit={edit}
            showProfileEdit={showProfileEdit}
            navigateToChangePasswordRoute={navigateToChangePasswordRoute}
            {...intlFunctions()}
        />);
        wrapper.find(Button).findWhere(b => b.key() === "profile.edit").simulate("click");
        expect(showProfileEdit).toHaveBeenCalled();
    });
});