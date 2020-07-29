import * as React from "react";

import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {Row, Col, Label} from "reactstrap";
import ProfileView from "../ProfileView";
import User from "../../../model/User";
import Generator from "../../../__tests__/environment/Generator";

describe("ProfileView", () => {

    let user: User;

    beforeEach(() => {
        user = Generator.generateUser();
    });

    it("correctly renders component with user details", () => {
        const wrapper = mountWithIntl(<ProfileView user={user}/>);
        const labels = wrapper.find(Row).find(Col).find(Label);

        expect(labels.length).toEqual(4);

        const firstNameLabel = labels.find("label#profile-first-name");
        const lastNameLabel = labels.find("label#profile-last-name");

        expect((firstNameLabel.getDOMNode() as HTMLLabelElement).textContent).toEqual(user.firstName);
        expect((lastNameLabel.getDOMNode() as HTMLLabelElement).textContent).toEqual(user.lastName);
    });
});