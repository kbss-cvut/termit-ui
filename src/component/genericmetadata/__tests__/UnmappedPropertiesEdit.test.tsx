import Generator from "../../../__tests__/environment/Generator";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { UnmappedPropertiesEdit } from "../UnmappedPropertiesEdit";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { GoPlus } from "react-icons/go";
import { shallow } from "enzyme";
import RdfsResource from "../../../model/RdfsResource";
import BadgeButton from "../../misc/BadgeButton";
import Utils from "../../../util/Utils";

jest.mock("../../misc/AssetLabel", () => () => <span>Asset</span>);

describe("UnmappedPropertiesEdit", () => {
  let onChange: (update: Map<string, string[]>) => void;
  let loadKnownProperties: () => void;
  let createProperty: (property: RdfsResource) => Promise<any>;
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
    const wrapper = render(existing);
    const value = wrapper.find("li");
    expect(value.length).toEqual(1);
    expect(value.text()).toContain(existing.get(property)![0]);
  });

  function render(
    existing: Map<string, string[]>,
    knownProperties: RdfsResource[] = []
  ) {
    return mountWithIntl(
      <UnmappedPropertiesEdit
        properties={existing}
        knownProperties={knownProperties}
        onChange={onChange}
        loadKnownProperties={loadKnownProperties}
        createProperty={createProperty}
        clearProperties={clearProperties}
        {...intlFunctions()}
      />
    );
  }

  it("removes prop value when delete button is clicked", () => {
    const property = Generator.generateUri();
    const existing = new Map([[property, ["test1", "test2"]]]);
    const wrapper = render(existing);

    const removeButtons = wrapper.find(BadgeButton);
    expect(removeButtons.length).toEqual(2);
    removeButtons.at(0).simulate("click");
    expect(onChange).toHaveBeenCalledWith(new Map([[property, ["test2"]]]));
  });

  it("removes property completely when only value is deleted", () => {
    const property = Generator.generateUri();
    const existing = new Map([[property, ["test1"]]]);
    const wrapper = render(existing);

    const removeButton = wrapper.find(BadgeButton);
    expect(removeButton.length).toEqual(1);
    removeButton.simulate("click");
    expect(onChange).toHaveBeenCalledWith(new Map());
  });

  it("adds new property with value when inputs are filled in and add button is clicked", () => {
    const wrapper = render(new Map());
    const property = Generator.generateUri();
    const value = "test";
    (
      wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit
    ).onPropertySelect(
      new RdfsResource({
        iri: property,
        label: "Property",
      })
    );
    const valueInput = wrapper.find('input[name="value"]');
    (valueInput.getDOMNode() as HTMLInputElement).value = value;
    valueInput.simulate("change", valueInput);
    wrapper.find(GoPlus).simulate("click");
    expect(onChange).toHaveBeenCalledWith(new Map([[property, [value]]]));
  });

  it("adds existing property value when inputs are filled in and add button is clicked", () => {
    const property = Generator.generateUri();
    const existing = new Map([[property, ["test"]]]);
    const wrapper = render(existing);
    const value = "test2";
    (
      wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit
    ).onPropertySelect(
      new RdfsResource({
        iri: property,
        label: "Property",
      })
    );
    const valueInput = wrapper.find('input[name="value"]');
    (valueInput.getDOMNode() as HTMLInputElement).value = value;
    valueInput.simulate("change", valueInput);
    wrapper.find(GoPlus).simulate("click");
    expect(onChange).toHaveBeenCalledWith(
      new Map([[property, ["test", "test2"]]])
    );
  });

  it("clears state on add", () => {
    const wrapper = render(new Map());
    const property = Generator.generateUri();
    const value = "test";
    (
      wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit
    ).onPropertySelect(
      new RdfsResource({
        iri: property,
        label: "Property",
      })
    );
    const valueInput = wrapper.find('input[name="value"]');
    (valueInput.getDOMNode() as HTMLInputElement).value = value;
    valueInput.simulate("change", valueInput);
    wrapper.find(GoPlus).simulate("click");
    expect(
      (wrapper.find('input[name="value"]').getDOMNode() as HTMLInputElement)
        .value.length
    ).toEqual(0);
  });

  it("keeps add button disabled when either input is empty", () => {
    const wrapper = render(new Map());
    let addButton = wrapper.find(GoPlus).parent();
    expect(addButton.prop("disabled")).toBeTruthy();
    (
      wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit
    ).onPropertySelect(
      new RdfsResource({
        iri: Generator.generateUri(),
        label: "Property",
      })
    );
    addButton = wrapper.find(GoPlus).parent();
    expect(addButton.prop("disabled")).toBeTruthy();
    const valueInput = wrapper.find('input[name="value"]');
    (valueInput.getDOMNode() as HTMLInputElement).value = "b";
    valueInput.simulate("change", valueInput);
    addButton = wrapper.find(GoPlus).parent();
    expect(addButton.prop("disabled")).toBeFalsy();
  });

  it("adds property value on Enter in the value field", () => {
    const wrapper = render(new Map());
    const property = Generator.generateUri();
    const value = "test";
    (
      wrapper.find(UnmappedPropertiesEdit).instance() as UnmappedPropertiesEdit
    ).onPropertySelect(
      new RdfsResource({
        iri: property,
        label: "Property",
      })
    );
    const valueInput = wrapper.find('input[name="value"]');
    (valueInput.getDOMNode() as HTMLInputElement).value = value;
    valueInput.simulate("change", valueInput);
    valueInput.simulate("keyPress", { key: "Enter" });
    expect(onChange).toHaveBeenCalled();
  });

  it("loads known properties on mount", () => {
    shallow(
      <UnmappedPropertiesEdit
        properties={new Map()}
        onChange={onChange}
        knownProperties={[]}
        loadKnownProperties={loadKnownProperties}
        {...intlFunctions()}
        createProperty={createProperty}
        clearProperties={clearProperties}
      />
    );
    expect(loadKnownProperties).toHaveBeenCalled();
  });

  it("invokes property creation action on created property", () => {
    createProperty = jest.fn().mockResolvedValue({});
    const wrapper = shallow(
      <UnmappedPropertiesEdit
        properties={new Map()}
        onChange={onChange}
        knownProperties={[]}
        loadKnownProperties={loadKnownProperties}
        createProperty={createProperty}
        clearProperties={clearProperties}
        {...intlFunctions()}
      />
    );
    const propertyData = {
      iri: Generator.generateUri(),
      label: "Test",
    };
    (wrapper.instance() as UnmappedPropertiesEdit).onCreateProperty(
      propertyData
    );
    expect(createProperty).toHaveBeenCalledWith(new RdfsResource(propertyData));
  });

  it("renders existing property values sorted lexicographically", () => {
    const property = Generator.generateUri();
    const values = ["m", "a", "s", "t", "E", "r"];
    const sortedValues = [...values];
    sortedValues.sort(Utils.localeComparator);
    const existing = new Map([[property, values]]);
    const wrapper = render(existing);

    const valuesRendered = wrapper.find("li");
    expect(valuesRendered.length).toEqual(sortedValues.length);
    for (let i = 0; i < sortedValues.length; i++) {
      expect(valuesRendered.get(i).props.children).toContain(sortedValues[i]);
    }
  });
});
