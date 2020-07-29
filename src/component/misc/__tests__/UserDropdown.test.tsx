import * as React from 'react';

import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {UserDropdown} from "../UserDropdown";
import {shallow} from "enzyme";
import User from "../../../model/User";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from "reactstrap";

describe("UserDropdown", () => {
    let logout: () => void;

    beforeEach(() => {
        logout = jest.fn();
    });

    const user = new User({
        firstName: "Catherine",
        lastName: "Halsey",
        username: "halsey@unsc.org",
        iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey"
    });

    it("renders correct structure of component", () => {
        const wrapper = shallow(<UserDropdown user={user} logout={logout} dark={true} {...intlFunctions()}/>);

        expect(wrapper.find(UncontrolledDropdown).find(DropdownToggle).contains(<>
            <i className="fas fa-user-circle align-middle user-icon"/>&nbsp;
            <span className="user-dropdown">{user.abbreviatedName}</span>
        </>));

        expect(wrapper.find(UncontrolledDropdown).find(DropdownMenu).find(DropdownItem).length).toBe(3);
    });

    it("renders logout button as the last one in the menu", () => {
        const wrapper = shallow(<UserDropdown user={user} logout={logout} dark={true} {...intlFunctions()}/>);

        const dropdownMenu = wrapper.find(UncontrolledDropdown).find(DropdownMenu);

        dropdownMenu.childAt(dropdownMenu.children().length - 1).simulate("click");
        expect(logout).toHaveBeenCalled();
    });
});
