import * as React from "react";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {TermSourcesEdit} from "../TermSourcesEdit";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {Badge, Button} from "reactstrap";

describe("TermSourcesEdit", () => {

    let onChange: (sources: string[]) => void;

    beforeEach(() => {
        onChange = jest.fn();
    });

    it("adds current input value to sources and invokes onChange on add click", () => {
        const wrapper = mountWithIntl(<TermSourcesEdit onChange={onChange} sources={[]} {...intlFunctions()}/>);
        const input = wrapper.find("input");
        const value = "new source";
        (input.getDOMNode() as HTMLInputElement).value = value;
        input.simulate("change", input);
        wrapper.find(Button).simulate("click");
        expect(onChange).toHaveBeenCalledWith([value]);
    });

    it("clears input value after adding new source", () => {
        const wrapper = mountWithIntl(<TermSourcesEdit onChange={onChange} sources={[]} {...intlFunctions()}/>);
        const input = wrapper.find("input");
        (input.getDOMNode() as HTMLInputElement).value = "new source";
        input.simulate("change", input);
        wrapper.find(Button).simulate("click");
        wrapper.update();
        expect((wrapper.find("input").getDOMNode() as HTMLInputElement).value).toEqual("");
    });

    it("supports adding input value as source on enter", () => {
        const wrapper = mountWithIntl(<TermSourcesEdit onChange={onChange} sources={[]} {...intlFunctions()}/>);
        const input = wrapper.find("input");
        const value = "new source";
        (input.getDOMNode() as HTMLInputElement).value = value;
        input.simulate("change", input);
        input.simulate("keyPress", {key: "Enter"});
        expect(onChange).toHaveBeenCalledWith([value]);
    });

    it("does nothing on add when input is empty", () => {
        const wrapper = mountWithIntl(<TermSourcesEdit onChange={onChange} sources={[]} {...intlFunctions()}/>);
        const input = wrapper.find("input");
        (input.getDOMNode() as HTMLInputElement).value = "";
        input.simulate("change", input);
        wrapper.find(Button).simulate("click");
        expect(onChange).not.toHaveBeenCalled();
    });

    it("removes source and calls onChange with updated sources when source remove button is clicked", () => {
        const sources = ["first", "second"];
        const wrapper = mountWithIntl(<TermSourcesEdit onChange={onChange} sources={sources} {...intlFunctions()}/>);
        wrapper.find(Badge).at(0).simulate("click");
        expect(onChange).toHaveBeenCalledWith([sources[1]]);
    });

    it("renders add button disabled when input is empty", () => {
        const wrapper = mountWithIntl(<TermSourcesEdit onChange={onChange} sources={[]} {...intlFunctions()}/>);
        expect(wrapper.find(Button).prop("disabled")).toBeTruthy();
        const input = wrapper.find("input");
        (input.getDOMNode() as HTMLInputElement).value = "aaa";
        input.simulate("change", input);
        expect(wrapper.find(Button).prop("disabled")).toBeFalsy();
    });
});
