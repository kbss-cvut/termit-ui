import { mountWithIntlAttached } from "../../annotator/__tests__/AnnotationUtil";
import HelpIcon from "../HelpIcon";
import { Popover } from "reactstrap";

jest.mock("popper.js");

describe("HelpIcon", () => {
  it("shows help popover on mouse over help icon", () => {
    const wrapper = mountWithIntlAttached(
      <HelpIcon id={"test-1"} text={"Test text."} />
    );
    expect(wrapper.find(Popover).prop("isOpen")).toBeFalsy();
    wrapper.find("svg.help-icon").simulate("mouseover");
    expect(wrapper.find(Popover).prop("isOpen")).toBeTruthy();
  });

  it("hides help popover on mouse out of help icon", () => {
    const wrapper = mountWithIntlAttached(
      <HelpIcon id={"test-1"} text={"Test text."} />
    );
    wrapper.find("svg.help-icon").simulate("mouseover");
    expect(wrapper.find(Popover).prop("isOpen")).toBeTruthy();
    wrapper.find("svg.help-icon").simulate("mouseout");
    expect(wrapper.find(Popover).prop("isOpen")).toBeFalsy();
  });

  it("pins popover on help icon click", () => {
    const wrapper = mountWithIntlAttached(
      <HelpIcon id={"test-1"} text={"Test text."} />
    );
    expect(wrapper.find(Popover).prop("isOpen")).toBeFalsy();
    wrapper.find("svg.help-icon").simulate("click");
    expect(wrapper.find(Popover).prop("isOpen")).toBeTruthy();
    wrapper.find("svg.help-icon").simulate("mouseout");
    expect(wrapper.find(Popover).prop("isOpen")).toBeTruthy();
  });

  it("unpins popover on repeated help icon click", () => {
    const wrapper = mountWithIntlAttached(
      <HelpIcon id={"test-1"} text={"Test text."} />
    );
    wrapper.find("svg.help-icon").simulate("click");
    expect(wrapper.find(Popover).prop("isOpen")).toBeTruthy();
    wrapper.find("svg.help-icon").simulate("mouseout");
    expect(wrapper.find(Popover).prop("isOpen")).toBeTruthy();
    wrapper.find("svg.help-icon").simulate("click");
    wrapper.find("svg.help-icon").simulate("mouseout");
    expect(wrapper.find(Popover).prop("isOpen")).toBeFalsy();
  });
});
