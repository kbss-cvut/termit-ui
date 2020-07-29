import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import UnmappedProperties from "../UnmappedProperties";
import {mountWithIntl} from "../../../__tests__/environment/Environment";

jest.mock("../../misc/AssetLabel");

describe("UnmappedProperties", () => {

    it("renders literal value for a property", () => {
        const properties = new Map([[Generator.generateUri(), ["test"]]]);
        const wrapper = mountWithIntl(<UnmappedProperties properties={properties}/>);
        const items = wrapper.find("li");
        expect(items.length).toEqual(1);
        expect(items.get(0).props.children).toEqual("test");
    });

    it("renders multiple literal values for a property", () => {
        const properties = new Map([[Generator.generateUri(), ["test", "test2"]]]);
        const wrapper = mountWithIntl(<UnmappedProperties properties={properties}/>);
        const items = wrapper.find("li");
        expect(items.length).toEqual(2);
        expect(items.get(0).props.children).toEqual("test");
        expect(items.get(1).props.children).toEqual("test2");
    });

    it("handles object value for a property", () => {
        const v = Generator.generateUri();
        const properties = new Map([[Generator.generateUri(), [{iri: v}]]]);
        // @ts-ignore
        const wrapper = mountWithIntl(<UnmappedProperties properties={properties}/>);
        const items = wrapper.find("li");
        expect(items.length).toEqual(1);
        expect(items.get(0).props.children).toEqual(v);
    });
});
