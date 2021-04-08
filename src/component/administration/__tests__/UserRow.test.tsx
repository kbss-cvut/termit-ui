import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import {shallow} from "enzyme";
import {UserActions, UserRow} from "../UserRow";
import {intlFunctions, mockUseI18n} from "../../../__tests__/environment/IntlUtil";
import User from "../../../model/User";
import Utils from "../../../util/Utils";
import VocabularyUtils from "../../../util/VocabularyUtils";

describe("UserRow", () => {
    let user: User;
    let actions: UserActions;

    beforeEach(() => {
        user = Generator.generateUser();
        actions = {
            disable: jest.fn(),
            enable: jest.fn(),
            unlock: jest.fn(),
            changeRole: jest.fn()
        };
        mockUseI18n();
    });

    it("renders disable button for non-disabled user", () => {
        const wrapper = shallow(<UserRow user={user} actions={actions} {...intlFunctions()} />);
        expect(wrapper.exists(`#user-${Utils.hashCode(user.iri)}-disable`)).toBeTruthy();
    });

    it("renders enable button for disabled user", () => {
        user.types.push(VocabularyUtils.USER_DISABLED);
        const wrapper = shallow(<UserRow user={user} actions={actions} {...intlFunctions()} />);
        expect(wrapper.exists(`#user-${Utils.hashCode(user.iri)}-disable`)).toBeFalsy();
        expect(wrapper.exists(`#user-${Utils.hashCode(user.iri)}-enable`)).toBeTruthy();
    });

    it("invokes disable action when disable button is clicked", () => {
        const wrapper = shallow(<UserRow user={user} actions={actions} {...intlFunctions()} />);
        const button = wrapper.find(`#user-${Utils.hashCode(user.iri)}-disable`);
        expect(button.exists()).toBeTruthy();
        button.simulate("click");
        expect(actions.disable).toHaveBeenCalledWith(user);
    });

    it("invokes enable action when enable button is clicked", () => {
        user.types.push(VocabularyUtils.USER_DISABLED);
        const wrapper = shallow(<UserRow user={user} actions={actions} {...intlFunctions()} />);
        const button = wrapper.find(`#user-${Utils.hashCode(user.iri)}-enable`);
        expect(button.exists()).toBeTruthy();
        button.simulate("click");
        expect(actions.enable).toHaveBeenCalledWith(user);
    });

    it("does not render action buttons for currently logged-in user", () => {
        const wrapper = shallow(<UserRow user={user} currentUser={true} actions={actions} {...intlFunctions()} />);
        expect(wrapper.exists("Button")).toBeFalsy();
    });

    it("renders unlock button for locked user", () => {
        user.types.push(VocabularyUtils.USER_LOCKED);
        const wrapper = shallow(<UserRow user={user} actions={actions} {...intlFunctions()} />);
        expect(wrapper.exists(`#user-${Utils.hashCode(user.iri)}-unlock`)).toBeTruthy();
    });

    it("invokes unlock action when unlock button is clicked", () => {
        user.types.push(VocabularyUtils.USER_LOCKED);
        const wrapper = shallow(<UserRow user={user} actions={actions} {...intlFunctions()} />);
        const button = wrapper.find(`#user-${Utils.hashCode(user.iri)}-unlock`);
        expect(button.exists()).toBeTruthy();
        button.simulate("click");
        expect(actions.unlock).toHaveBeenCalledWith(user);
    });

    it("renders admin user with admin badge", () => {
        user.types.push(VocabularyUtils.USER_ADMIN);
        const wrapper = shallow(<UserRow user={user} actions={actions} {...intlFunctions()} />);
        expect(wrapper.exists(".m-user-admin")).toBeTruthy();
    });
});
