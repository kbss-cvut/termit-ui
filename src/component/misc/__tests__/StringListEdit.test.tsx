import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { StringListEdit } from "../StringListEdit";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { Button } from "reactstrap";
import BadgeButton from "../BadgeButton";

jest.mock("../../misc/HelpIcon", () => () => <span>Help</span>);
jest.mock("../../misc/MultilingualIcon", () => () => <span>Multilingual</span>);

describe("StringListEdit", () => {
  let onChange: (list: string[]) => void;

  beforeEach(() => {
    onChange = jest.fn();
  });

  it("adds current input value to list and invokes onChange on add click", () => {
    const wrapper = mountWithIntl(
      <StringListEdit
        onChange={onChange}
        list={[]}
        i18nPrefix={""}
        {...intlFunctions()}
      />
    );
    const input = wrapper.find("input");
    const value = "new item";
    (input.getDOMNode() as HTMLInputElement).value = value;
    input.simulate("change", input);
    wrapper.find(Button).simulate("click");
    expect(onChange).toHaveBeenCalledWith([value]);
  });

  it("clears input value after adding new item", () => {
    const wrapper = mountWithIntl(
      <StringListEdit
        onChange={onChange}
        list={[]}
        i18nPrefix={""}
        {...intlFunctions()}
      />
    );
    const input = wrapper.find("input");
    (input.getDOMNode() as HTMLInputElement).value = "new item";
    input.simulate("change", input);
    wrapper.find(Button).simulate("click");
    wrapper.update();
    expect(
      (wrapper.find("input").getDOMNode() as HTMLInputElement).value
    ).toEqual("");
  });

  it("supports adding input value as item on enter", () => {
    const wrapper = mountWithIntl(
      <StringListEdit
        onChange={onChange}
        list={[]}
        i18nPrefix={""}
        {...intlFunctions()}
      />
    );
    const input = wrapper.find("input");
    const value = "new item";
    (input.getDOMNode() as HTMLInputElement).value = value;
    input.simulate("change", input);
    input.simulate("keyPress", { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith([value]);
  });

  it("does nothing on add when input is empty", () => {
    const wrapper = mountWithIntl(
      <StringListEdit
        onChange={onChange}
        list={[]}
        i18nPrefix={""}
        {...intlFunctions()}
      />
    );
    const input = wrapper.find("input");
    (input.getDOMNode() as HTMLInputElement).value = "";
    input.simulate("change", input);
    wrapper.find(Button).simulate("click");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes item and calls onChange with updated items when item remove button is clicked", () => {
    const items = ["first", "second"];
    const wrapper = mountWithIntl(
      <StringListEdit
        onChange={onChange}
        list={items}
        i18nPrefix={""}
        {...intlFunctions()}
      />
    );
    wrapper.find(BadgeButton).at(0).simulate("click");
    expect(onChange).toHaveBeenCalledWith([items[1]]);
  });

  it("renders add button disabled when input is empty", () => {
    const wrapper = mountWithIntl(
      <StringListEdit
        onChange={onChange}
        list={[]}
        i18nPrefix={""}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(Button).prop("disabled")).toBeTruthy();
    const input = wrapper.find("input");
    (input.getDOMNode() as HTMLInputElement).value = "aaa";
    input.simulate("change", input);
    expect(wrapper.find(Button).prop("disabled")).toBeFalsy();
  });
});
