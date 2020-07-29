import * as React from "react";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import PanelWithActions from "../PanelWithActions";
import {Button} from "reactstrap";

describe("Panel With Actions", () => {
    it("Panel heading contains all actions and no other", () => {
        const actions = [<Button key="b1"/>, <Button key="b2"/>];
        const wrapper = mountWithIntl(<PanelWithActions title={""} actions={actions}>
            <div>Test</div>
        </PanelWithActions>);
        expect(wrapper.find("CardHeader").find("Button").length).toEqual(2);
    });
});