import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {UnmappedPropertiesEdit} from "../UnmappedPropertiesEdit";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {Badge} from "reactstrap";
import {GoPlus} from "react-icons/go";
import {shallow} from "enzyme";
import RdfsResource from "../../../model/RdfsResource";

jest.mock("../../misc/AssetLabel");

describe("UnmappedPropertiesEdit", () => {

    let onChange: (update: Map<string, string[]>) => void;
    let loadKnownProperties: () => void;
    let createProperty: (property: RdfsResource) => void;
    let clearProperties: () => void;

    beforeEach(() => {
        onChange = jest.fn();
        loadKnownProperties = jest.fn();
        createProperty = jest.fn();
        clearProperties = jest.fn();
    });

    it("renders existing properties", () => {
        const property = Generator.generateUri();
        const existing = new Map([[property, ["test"]]]);
        const wrapper = mountWithIntl(<UnmappedPropertiesEdit properties={existing} knownProperties={[]}
                                                              onChange={onChange}
                                                              loadKnownProperties={loadKnownProperties}
                                                              createProperty={createProperty}
                                                              clearProperties={clearProperties} {...intlFunctions()}/>);
        const value = wrapper.find("li");
        expect(value.length).toEqual(1);
        expect(value.text()).toContain(existing.get(property)![0]);
    });

    it("removes prop value when delete button is clicked", () => {
        const property = Generator.generateUri();
        const existing = new Map([[property, ["test1", "test2"]]]);
        const wrapper = mountWithIntl(<UnmappedPropertiesEdit properties={existing} knownProperties={[]}
                                                              onChange={onChange}
                                                              loadKnownProperties={loadKnownProperties}
                                                              createProperty={createProperty}
                                                              clearProperties={clearProperties} {...intlFunctions()}/>);

        const removeButtons = wrapper.find(Badge);
        expect(removeButtons.length).toEqual(2);
        removeButtons.at(0).simulate("click");
        expect(onChange).toHaveBeenCalledWith(new Map([[property, ["test2"]]]));
    });

    it("removes property completely when only value is deleted", () => {
        const property = Generator.generateUri();
        const existing = new Map([[property, ["test1"]]]);
        const wrapper = mountWithIntl(<UnmappedPropertiesEdit properties={existing} knownProperties={[]}
                                                              onChange={onChange}
                                                              loadKnownProperties={loadKnownProperties}
                                                              createProperty={createProperty}
                                                              clearProperties={clearProperties} {...intlFunctions()}/>);

        const removeButton = wrapper.find(Badge);
        expect(removeButton.length).toEqual(1);
        removeButton.simulate("click");
        expect(onChange).toHaveBeenCalledWith(new Map());
    });

    it("adds new property with value when inputs are filled in and add button is clicked", () => {
        const wrapper = mountWithIntl(<UnmappedPropertiesEdit properties={new Map()} knownProperties={[]}
                                                              onChange={onChange}
                                                              loadKnownProperties={loadKnownProperties}
                                                              createProperty={createProperty}
                                                              clearProperties={clearProperties} {...intlFunctions()}/>);
        const property = Generator.generateUri();
        const value = "test";
        (wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit).onPropertySelect(new RdfsResource({
            iri: property,
            label: "Property"
        }));
        const valueInput = wrapper.find("input[name=\"value\"]");
        (valueInput.getDOMNode() as HTMLInputElement).value = value;
        valueInput.simulate("change", valueInput);
        wrapper.find(GoPlus).simulate("click");
        expect(onChange).toHaveBeenCalledWith(new Map([[property, [value]]]));
    });

    it("adds existing property value when inputs are filled in and add button is clicked", () => {
        const property = Generator.generateUri();
        const existing = new Map([[property, ["test"]]]);
        const wrapper = mountWithIntl(<UnmappedPropertiesEdit properties={existing} knownProperties={[]}
                                                              onChange={onChange}
                                                              loadKnownProperties={loadKnownProperties}
                                                              createProperty={createProperty}
                                                              clearProperties={clearProperties} {...intlFunctions()}/>);
        const value = "test2";
        (wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit).onPropertySelect(new RdfsResource({
            iri: property,
            label: "Property"
        }));
        const valueInput = wrapper.find("input[name=\"value\"]");
        (valueInput.getDOMNode() as HTMLInputElement).value = value;
        valueInput.simulate("change", valueInput);
        wrapper.find(GoPlus).simulate("click");
        expect(onChange).toHaveBeenCalledWith(new Map([[property, ["test", "test2"]]]));
    });

    it("clears state on add", () => {
        const wrapper = mountWithIntl(<UnmappedPropertiesEdit properties={new Map()} knownProperties={[]}
                                                              onChange={onChange}
                                                              loadKnownProperties={loadKnownProperties}
                                                              createProperty={createProperty}
                                                              clearProperties={clearProperties} {...intlFunctions()}/>);
        const property = Generator.generateUri();
        const value = "test";
        (wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit).onPropertySelect(new RdfsResource({
            iri: property,
            label: "Property"
        }));
        const valueInput = wrapper.find("input[name=\"value\"]");
        (valueInput.getDOMNode() as HTMLInputElement).value = value;
        valueInput.simulate("change", valueInput);
        wrapper.find(GoPlus).simulate("click");
        expect((wrapper.find("input[name=\"value\"]").getDOMNode() as HTMLInputElement).value.length).toEqual(0);
    });

    it("keeps add button disabled when either input is empty", () => {
        const wrapper = mountWithIntl(<UnmappedPropertiesEdit properties={new Map()} knownProperties={[]}
                                                              onChange={onChange}
                                                              loadKnownProperties={loadKnownProperties}
                                                              createProperty={createProperty}
                                                              clearProperties={clearProperties} {...intlFunctions()}/>);
        let addButton = wrapper.find(GoPlus).parent();
        expect(addButton.prop("disabled")).toBeTruthy();
        (wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit).onPropertySelect(new RdfsResource({
            iri: Generator.generateUri(),
            label: "Property"
        }));
        addButton = wrapper.find(GoPlus).parent();
        expect(addButton.prop("disabled")).toBeTruthy();
        const valueInput = wrapper.find("input[name=\"value\"]");
        (valueInput.getDOMNode() as HTMLInputElement).value = "b";
        valueInput.simulate("change", valueInput);
        addButton = wrapper.find(GoPlus).parent();
        expect(addButton.prop("disabled")).toBeFalsy();
    });

    it("adds property value on Enter in the value field", () => {
        const wrapper = mountWithIntl(<UnmappedPropertiesEdit properties={new Map()} knownProperties={[]}
                                                              onChange={onChange}
                                                              loadKnownProperties={loadKnownProperties}
                                                              createProperty={createProperty}
                                                              clearProperties={clearProperties} {...intlFunctions()}/>);
        const property = Generator.generateUri();
        const value = "test";
        (wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit).onPropertySelect(new RdfsResource({
            iri: property,
            label: "Property"
        }));
        const valueInput = wrapper.find("input[name=\"value\"]");
        (valueInput.getDOMNode() as HTMLInputElement).value = value;
        valueInput.simulate("change", valueInput);
        valueInput.simulate("keyPress", {key: "Enter"});
        expect(onChange).toHaveBeenCalled();
    });

    it("loads known properties on mount", () => {
        shallow(<UnmappedPropertiesEdit properties={new Map()} onChange={onChange} knownProperties={[]}
                                        loadKnownProperties={loadKnownProperties} {...intlFunctions()}
                                        createProperty={createProperty} clearProperties={clearProperties}/>);
        expect(loadKnownProperties).toHaveBeenCalled();
    });

    it("invokes property creation action on created property", () => {
        const wrapper = shallow(<UnmappedPropertiesEdit properties={new Map()} onChange={onChange} knownProperties={[]}
                                                        loadKnownProperties={loadKnownProperties}
                                                        createProperty={createProperty}
                                                        clearProperties={clearProperties} {...intlFunctions()}/>);
        const propertyData = {
            iri: Generator.generateUri(),
            label: "Test"
        };
        (wrapper.instance() as UnmappedPropertiesEdit).onCreateProperty(propertyData);
        expect(createProperty).toHaveBeenCalledWith(new RdfsResource(propertyData));
    });

    it("schedules property clear on unmount when new property was created", () => {
        const wrapper = shallow(<UnmappedPropertiesEdit properties={new Map()} onChange={onChange} knownProperties={[]}
                                                        loadKnownProperties={loadKnownProperties}
                                                        createProperty={createProperty}
                                                        clearProperties={clearProperties} {...intlFunctions()}/>);
        const propertyData = {
            iri: Generator.generateUri(),
            label: "Test"
        };
        (wrapper.instance() as UnmappedPropertiesEdit).onCreateProperty(propertyData);
        wrapper.unmount();
        expect(clearProperties).toHaveBeenCalled();
    });
});
