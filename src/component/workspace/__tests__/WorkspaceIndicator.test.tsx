import * as React from "react";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {WorkspaceIndicator} from "../WorkspaceIndicator";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import Workspace from "../../../model/Workspace";
import Constants from "../../../util/Constants";


describe("WorkspaceIndicator", () => {

    afterEach(() => {
        jest.resetModules();
    });

    it("renders nothing when workspace is not available", () => {
        const wrapper = mountWithIntl(<WorkspaceIndicator workspace={null} {...intlFunctions()}/>);
        expect(wrapper.text()).toEqual("");
    });

    it("renders workspace label as simple text when control panel URL is not configured", () => {
        jest.mock("../../../util/Constants", () => ({CONTROL_PANEL_URL: ""}));
        Constants.CONTROL_PANEL_URL = "";
        const ws = new Workspace({iri: Generator.generateUri(), label: "Test workspace"});
        const wrapper = mountWithIntl(<WorkspaceIndicator workspace={ws} {...intlFunctions()}/>);
        expect(wrapper.text()).toContain(ws.label);
        expect(wrapper.exists("a")).not.toBeTruthy();
    });

    it("renders workspace label as link to workspace detail in control panel when control panel URL is configured", () => {
        jest.mock("../../../util/Constants", () => ({CONTROL_PANEL_URL: ""}));
        Constants.CONTROL_PANEL_URL = "http://example.org/control-panel";
        const ws = new Workspace({iri: Generator.generateUri(), label: "Test workspace"});
        const wrapper = mountWithIntl(<WorkspaceIndicator workspace={ws} {...intlFunctions()}/>);
        expect(wrapper.text()).toContain(ws.label);
        const link = wrapper.find("a");
        expect(link.exists()).toBeTruthy();
        expect(link.getElement().props.href).toContain(Constants.CONTROL_PANEL_URL);
    });
});
