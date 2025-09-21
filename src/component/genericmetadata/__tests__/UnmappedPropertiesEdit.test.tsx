import Generator from "../../../__tests__/environment/Generator";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import UnmappedPropertiesEdit from "../UnmappedPropertiesEdit";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import { GoPlus } from "react-icons/go";
import RdfsResource from "../../../model/RdfsResource";
import BadgeButton from "../../misc/BadgeButton";
import Utils from "../../../util/Utils";
import { langString } from "../../../model/MultilingualString";
import { PropertyValueType } from "../../../model/WithUnmappedProperties";
import Constants from "../../../util/Constants";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import * as Redux from "react-redux";
import { act } from "react-dom/test-utils";
import * as AsyncActions from "../../../action/AsyncActions";

jest.mock("../../misc/AssetLabel", () => () => <span>Asset</span>);
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

describe("UnmappedPropertiesEdit", () => {
  let onChange: (update: Map<string, PropertyValueType[]>) => void;

  beforeEach(() => {
    onChange = jest.fn();
    jest.spyOn(Redux, "useSelector").mockReturnValue([
      new RdfsResource({
        iri: Generator.generateUri(),
        label: langString("Known unmapped property"),
      }),
    ]);
    const mockDispatch = jest.fn().mockResolvedValue({});
    jest.spyOn(Redux, "useDispatch").mockReturnValue(mockDispatch);
    mockUseI18n();
  });

  it("renders existing properties", () => {
    const property = Generator.generateUri();
    const existing = new Map([[property, ["test"]]]);
    const wrapper = render(existing);
    const value = wrapper.find("li");
    expect(value.length).toEqual(1);
    expect(value.text()).toContain(existing.get(property)![0]);
  });

  function render(existing: Map<string, PropertyValueType[]>) {
    return mountWithIntl(
      <UnmappedPropertiesEdit
        assetType="term"
        properties={existing}
        onChange={onChange}
        languages={["en", "cs"]}
        language={Constants.DEFAULT_LANGUAGE}
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
    act(() => {
      (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(
        new RdfsResource({
          iri: property,
          label: langString("Property"),
        })
      );
    });
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
    act(() => {
      (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(
        new RdfsResource({
          iri: property,
          label: langString("Property"),
        })
      );
    });
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
    act(() => {
      (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(
        new RdfsResource({
          iri: property,
          label: langString("Property"),
        })
      );
    });
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
    act(() => {
      (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(
        new RdfsResource({
          iri: Generator.generateUri(),
          label: langString("Property"),
        })
      );
    });
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
    act(() => {
      (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(
        new RdfsResource({
          iri: property,
          label: langString("Property"),
        })
      );
    });
    const valueInput = wrapper.find('input[name="value"]');
    (valueInput.getDOMNode() as HTMLInputElement).value = value;
    valueInput.simulate("change", valueInput);
    valueInput.simulate("keyPress", { key: "Enter" });
    expect(onChange).toHaveBeenCalled();
  });

  it("loads known properties on mount", () => {
    jest.spyOn(AsyncActions, "getProperties");
    render(new Map());
    expect(AsyncActions.getProperties).toHaveBeenCalled();
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
