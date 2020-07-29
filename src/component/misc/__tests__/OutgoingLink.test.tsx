import * as React from "react";
import {OutgoingLink} from "../OutgoingLink";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {mount} from "enzyme";

describe("OutgoingLink", () => {
    it("OutgoingLink shows the link symbol by default", () => {
        const wrapper = mount(<OutgoingLink
            label="label"
            iri="http://link.me/link" {...intlFunctions()}
        />);
        expect(wrapper.contains(<small>
            <i className="fas fa-external-link-alt text-primary"/>
        </small>)).toBeTruthy();
    });
    it("OutgoingLink does not show the link symbol for showLink=false", () => {
        const wrapper = mount(<OutgoingLink
            label="label"
            iri="http://link.me/link" {...intlFunctions()}
            showLink={false}
        />);
        expect(wrapper.find("span[className=\"hidden\"]").exists()).toBeTruthy();
    });
});

