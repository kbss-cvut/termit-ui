import * as React from "react";

import {mountWithIntl} from "../../../__tests__/environment/Environment";
import User from "../../../model/User";
import {AsyncAction} from "../../../action/ActionType";
import Generator from "../../../__tests__/environment/Generator";
import {i18n, intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {ChangePassword} from "../ChangePassword";
import {CardHeader, CardBody, Form, Row, ButtonToolbar, Button} from "reactstrap";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import {ReactWrapper, shallow} from "enzyme";

jest.mock("../../../util/Routing");

describe("ChangePassword", () => {

    let user: User;
    let changePassword: (user: User) => Promise<AsyncAction>;

    beforeEach(() => {
        changePassword = jest.fn().mockImplementation(() => Promise.resolve({}));
        user = Generator.generateUser();
    });

    it("correctly renders component", () => {
        const wrapper = mountWithIntl(<ChangePassword changePassword={changePassword}
                                                      user={user} {...intlFunctions()}/>);
        const cardHeader = wrapper.find(CardHeader);
        const rows = wrapper.find(CardBody).find(Form).find(Row);

        const currentPasswordInput = rows.first().find("input[name=\"currentPassword\"]");
        const newPasswordInput = rows.at(1).find("input[name=\"newPassword\"]");
        const confirmPasswordInput = rows.at(1).find("input[name=\"confirmPassword\"]");
        const buttonToolbar = rows.last().find(ButtonToolbar);
        const submitButtonSubmit = buttonToolbar.find("button#change-password-submit");
        const cancelButton = buttonToolbar.find("button#change-password-cancel");

        expect(cardHeader.contains(<div className="flex-grow-1">{i18n("profile.change-password")}</div>));
        expect(rows.length).toEqual(3);
        expect(currentPasswordInput.length).toEqual(1);
        expect(newPasswordInput.length).toEqual(1);
        expect(confirmPasswordInput.length).toEqual(1);
        expect(submitButtonSubmit.length).toEqual(1);
        expect(cancelButton.length).toEqual(1);
    });

    it("navigates to profile route on cancel", () => {
        const wrapper = shallow(<ChangePassword changePassword={changePassword}
                                                user={user} {...intlFunctions()}/>);
        const cancelButton = wrapper.find(Button).findWhere(b => b.prop("id") === "change-password-cancel");
        cancelButton.simulate("click");
        expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.profile);
    });

    it("renders disabled submit button if all fields are empty", () => {
        const wrapper = mountWithIntl(<ChangePassword changePassword={changePassword}
                                                      user={user} {...intlFunctions()}/>);

        const button = wrapper.find("button#change-password-submit");
        button.simulate("click");
        expect(button.getElement().props.disabled).toBeTruthy();
        expect(changePassword).not.toHaveBeenCalled();
    });

    function fillPasswords(wrapper: ReactWrapper, different: boolean = false): void {
        const currentPasswordINput = wrapper.find("input[name=\"currentPassword\"]");
        (currentPasswordINput.getDOMNode() as HTMLInputElement).value = "current";
        currentPasswordINput.simulate("change", currentPasswordINput);
        const newPasswordInput = wrapper.find("input[name=\"newPassword\"]");
        (newPasswordInput.getDOMNode() as HTMLInputElement).value = "new123";
        newPasswordInput.simulate("change", newPasswordInput);
        const confirmPasswordInput = wrapper.find("input[name=\"confirmPassword\"]");
        (confirmPasswordInput.getDOMNode() as HTMLInputElement).value = different ? "diff" : "new123";
        confirmPasswordInput.simulate("change", confirmPasswordInput);
    }

    it("disables submit button when passwords do not match", () => {
        const wrapper = mountWithIntl(<ChangePassword changePassword={changePassword}
                                                      user={user} {...intlFunctions()}/>);
        fillPasswords(wrapper, true);
        const submitButton = wrapper.find("button#change-password-submit");
        expect(submitButton.getElement().props.disabled).toBeTruthy();
    });

    it("calls changePassword function on submit button click if every field is filled correctly", () => {
        const wrapper = mountWithIntl(<ChangePassword changePassword={changePassword}
                                                      user={user} {...intlFunctions()}/>);
        fillPasswords(wrapper, false);
        const submitButton = wrapper.find("button#change-password-submit");

        submitButton.simulate("click");
        expect(changePassword).toHaveBeenCalled();
    });
});