import * as React from "react";

import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {Sidebar} from "../Sidebar";
import {shallow} from "enzyme";
import User from "../../../model/User";
import {Container, Form} from "reactstrap";
import {routingProps} from "../../../__tests__/environment/TestUtil";

describe("Sidebar", () => {
    let toggleSidebar: () => void;

    const user = new User({
        firstName: "Catherine",
        lastName: "Halsey",
        username: "halsey@unsc.org",
        iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey"
    });

    beforeEach(() => {
        toggleSidebar = jest.fn();
    });

    it("renders correct structure of component on desktop with sidebar expanded", () => {
        const wrapper = shallow(<Sidebar user={user} toggleSidebar={toggleSidebar} sidebarExpanded={true}
                                         desktopView={true} {...intlFunctions()} {...routingProps()}/>);

        const container = wrapper.find("#sidenav-main.sidebar-expanded").find(Container);

        expect(container.find(".brand").length).toBe(1);
        expect(container.find("#toggler").contains([
            <i key="1" className="fas fa-chevron-left fa-xs"/>,
            <i key="2" className="fas fa-bars fa-lg line-height-1"/>])).toBeTruthy();

        expect(container.find("#dropdown").length).toBe(0);

        expect(container.find(Form).length).toBe(0);
    });

    it("renders correct structure of component on desktop with sidebar collapsed", () => {
        const wrapper = shallow(<Sidebar user={user} toggleSidebar={toggleSidebar} sidebarExpanded={false}
                                         desktopView={true} {...intlFunctions()} {...routingProps()}/>);

        const container = wrapper.find("#sidenav-main.sidebar-collapsed").find(Container);

        expect(container.find(".brand").length).toBe(0);
        expect(container.find("#toggler").contains([
            <i key="1" className="fas fa-bars fa-lg line-height-1"/>,
            <i key="2" className="fas fa-chevron-right fa-xs"/>])).toBeTruthy();

        expect(container.find("#dropdown").length).toBe(0);
        expect(container.find(".navbar-heading").length).toBe(0);

        expect(container.find(Form).length).toBe(0);
    });

    it("renders correct structure on mobile", () => {
        const wrapper = shallow(<Sidebar user={user} toggleSidebar={toggleSidebar} sidebarExpanded={false}
                                         desktopView={false} {...intlFunctions()} {...routingProps()}/>);

        const container = wrapper.find("#sidenav-main").find(Container);
        expect(container.find(".brand").length).toBe(2);
        expect(container.find("#toggler").contains(
            <i key="1" className="fas fa-bars fa-lg line-height-1"/>
        )).toBeFalsy();

        expect(container.find(".navbar-toggler").length).toBe(2);
        expect(container.find("#dropdown").length).toBe(1);
        expect(container.find(".navbar-heading").length).toBe(0);

        expect(container.find(Form).length).toBe(1);
    });
});
