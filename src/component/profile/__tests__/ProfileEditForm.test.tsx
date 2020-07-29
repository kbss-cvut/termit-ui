import * as React from "react";

import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {Button, ButtonToolbar, Form} from "reactstrap";
import {ProfileEditForm} from "../ProfileEditForm";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {shallow} from "enzyme";

describe("ProfileEditForm", () => {

    let firstName: string;
    let lastName: string;
    let onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    let onSubmit: () => void;
    let onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    let showProfileView: () => void;
    let isValid: boolean;

    beforeEach(() => {
        firstName = "FirstName";
        lastName = "LastName";
        onChange = jest.fn();
        onSubmit = jest.fn();
        onKeyPress = jest.fn();
        showProfileView = jest.fn();
        isValid = true;
    });

    it("correctly renders component with firstName and lastName set", () => {
        const wrapper = mountWithIntl(<ProfileEditForm
            firstName={firstName}
            lastName={lastName}
            onChange={onChange}
            onSubmit={onSubmit}
            onKeyPress={onKeyPress}
            showProfileView={showProfileView}
            isValid={isValid}
            {...intlFunctions()}
        />);

        const form = wrapper.find(Form);
        const firstNameInput = form.find("input[name=\"firstName\"]").getDOMNode() as HTMLInputElement;
        const lastNameInput = form.find("input[name=\"lastName\"]").getDOMNode() as HTMLInputElement;
        const buttons = form.find(ButtonToolbar).find(Button);

        expect(firstNameInput.value).toEqual(firstName);
        expect(lastNameInput.value).toEqual(lastName);
        expect(buttons.length).toEqual(2);
        expect(buttons.find("button#profile-edit-submit").length).toEqual(1);
        expect(buttons.find("button#profile-edit-cancel").length).toEqual(1);
    });

    it("calls onSubmit function on save button click if isValid", () => {
        const wrapper = mountWithIntl(<ProfileEditForm
            firstName={firstName}
            lastName={lastName}
            onChange={onChange}
            onSubmit={onSubmit}
            onKeyPress={onKeyPress}
            showProfileView={showProfileView}
            isValid={isValid}
            {...intlFunctions()}
        />);

        const button = wrapper.find("button#profile-edit-submit");
        button.simulate("click");
        expect(button.getElement().props.disabled).toBeFalsy();
        expect(onSubmit).toHaveBeenCalled();
    });

    it("renders disabled submit button if !isValid", () => {
        const wrapper = mountWithIntl(<ProfileEditForm
            firstName={firstName}
            lastName={lastName}
            onChange={onChange}
            onSubmit={onSubmit}
            onKeyPress={onKeyPress}
            showProfileView={showProfileView}
            isValid={false}
            {...intlFunctions()}
        />);

        const button = wrapper.find("button#profile-edit-submit");
        button.simulate("click");
        expect(button.getElement().props.disabled).toBeTruthy();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("calls showProfileView on cancel button click", () => {
        const wrapper = shallow(<ProfileEditForm
            firstName={firstName}
            lastName={lastName}
            onChange={onChange}
            onSubmit={onSubmit}
            onKeyPress={onKeyPress}
            showProfileView={showProfileView}
            isValid={isValid}
            {...intlFunctions()}
        />);

        wrapper.find(Button).findWhere(b => b.prop("id") === "profile-edit-cancel").simulate("click");
        expect(showProfileView).toHaveBeenCalled();
    });

    it("invokes onKeyPress function when enter is pressed", () => {
        const wrapper = mountWithIntl(<ProfileEditForm
            firstName={firstName}
            lastName={lastName}
            onChange={onChange}
            onSubmit={onSubmit}
            onKeyPress={onKeyPress}
            showProfileView={showProfileView}
            isValid={isValid}
            {...intlFunctions()}
        />);

        const lastNameInput = wrapper.find("input[name=\"lastName\"]");
        lastNameInput.simulate("keyPress", {key: "Enter"});
        expect(onKeyPress).toHaveBeenCalled();
    });
});
