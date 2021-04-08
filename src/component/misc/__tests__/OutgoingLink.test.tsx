import * as React from "react";
import {OutgoingLink} from "../OutgoingLink";
import {mountWithIntl} from "../../../__tests__/environment/Environment";

describe("OutgoingLink", () => {
    it("OutgoingLink shows the link symbol by default", () => {
        const wrapper = mountWithIntl(<OutgoingLink label="label" iri="http://link.me/link" />);
        expect(
            wrapper.contains(
                <small>
                    <i className="fas fa-external-link-alt text-primary" />
                </small>
            )
        ).toBeTruthy();
    });
    it("OutgoingLink does not show the link symbol for showLink=false", () => {
        const wrapper = mountWithIntl(<OutgoingLink label="label" iri="http://link.me/link" showLink={false} />);
        expect(wrapper.find('span[className="hidden"]').exists()).toBeTruthy();
    });
});
