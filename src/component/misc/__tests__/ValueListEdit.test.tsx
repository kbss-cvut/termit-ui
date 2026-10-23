import { renderWithIntl } from "../../../__tests__/environment/Environment";
import ValueListEdit from "../ValueListEdit";
import { i18n } from "../../../__tests__/environment/IntlUtil";
import { fireEvent, screen } from "@testing-library/react";

vi.mock("../../misc/HelpIcon", () => ({ default: () => <span>Help</span> }));
vi.mock("../../misc/MultilingualIcon", () => ({
  default: () => <span>Multilingual</span>,
}));

describe("ValueListEdit", () => {
  let onChange: (list: string[]) => void;

  beforeEach(() => {
    onChange = vi.fn();
  });

  function renderEdit(list: string[]) {
    return renderWithIntl(
      <ValueListEdit onChange={onChange} list={list} i18nPrefix={""} />
    );
  }

  function input(): HTMLInputElement {
    return document.querySelector(
      'input[name="add-string-input"]'
    ) as HTMLInputElement;
  }

  function addButton(): HTMLElement {
    return screen.getByTitle(i18n("stringlistedit.button.add.tooltip"));
  }

  it("adds current input value to list and invokes onChange on add click", () => {
    renderEdit([]);
    const value = "new item";
    fireEvent.change(input(), { target: { value } });
    fireEvent.click(addButton());
    expect(onChange).toHaveBeenCalledWith([value]);
  });

  it("clears input value after adding new item", () => {
    renderEdit([]);
    fireEvent.change(input(), { target: { value: "new item" } });
    fireEvent.click(addButton());
    expect(input()).toHaveValue("");
  });

  it("supports adding input value as item on enter", () => {
    renderEdit([]);
    const value = "new item";
    fireEvent.change(input(), { target: { value } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith([value]);
  });

  it("does nothing on add when input is empty", () => {
    renderEdit([]);
    fireEvent.change(input(), { target: { value: "" } });
    fireEvent.click(addButton());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes item and calls onChange with updated items when item remove button is clicked", () => {
    const items = ["first", "second"];
    renderEdit(items);
    const removeButtons = screen.getAllByTitle(
      i18n("stringlistedit.button.remove.tooltip")
    );
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith([items[1]]);
  });

  it("renders add button disabled when input is empty", () => {
    renderEdit([]);
    expect(addButton()).toBeDisabled();
    fireEvent.change(input(), { target: { value: "aaa" } });
    expect(addButton()).not.toBeDisabled();
  });
});
