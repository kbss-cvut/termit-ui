import * as React from "react";
import AssetLink from "../AssetLink";
import {EMPTY_VOCABULARY} from "../../../model/Vocabulary";
import {MemoryRouter} from "react-router";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {shallow} from "enzyme";

describe("Asset Link", () => {
    const voc = EMPTY_VOCABULARY;

    it("Render internal link", () => {
        const wrapper = mountWithIntl(<MemoryRouter><AssetLink
            asset={voc}
            path={"/vocabulary"}
        /></MemoryRouter>);
        expect(wrapper.find("Link[to=\"/vocabulary\"]").exists()).toBeTruthy();
    });
    it("Render outgoing link", () => {
        const wrapper = mountWithIntl(<MemoryRouter><AssetLink
            asset={voc}
            path={"/vocabulary"}
        /></MemoryRouter>);
        expect(wrapper.find("a[href=\"http://empty\"]").exists()).toBeTruthy();
    });
    it("showLink is false by default", () => {
        const wrapper = shallow(<AssetLink
            asset={voc}
            path={"/vocabulary"}
        />);
        expect(wrapper.state("showLink")).toBeFalsy();
    });
    it("On mouse out sets showLink to false", () => {
        const wrapper = shallow(<AssetLink
            asset={voc}
            path={"/vocabulary"}
        />);
        wrapper.find("span").simulate("mouseOver");
        expect(wrapper.state("showLink")).toBeTruthy();
    });
    it("On mouse over sets showLink to true", () => {
        const wrapper = shallow(<AssetLink
            asset={voc}
            path={"/vocabulary"}
        />);
        wrapper.setState({showLink : false});
        wrapper.find("span").simulate("mouseOut");
        expect(wrapper.state("showLink")).toBeFalsy();
    });
});

