import { renderWithIntl } from "../../../__tests__/environment/Environment";
import HelpIcon from "../HelpIcon";
import { fireEvent, waitFor } from "@testing-library/react";

describe("HelpIcon", () => {
  function renderIcon() {
    return renderWithIntl(<HelpIcon id={"test-1"} text={"Test text."} />);
  }

  function icon(): SVGElement {
    return document.querySelector("svg.help-icon") as SVGElement;
  }

  // The popover element remains in the DOM while it fades out, so open
  // state is checked via the .show class on the .popover element.
  function popoverOpen(): boolean {
    return document.querySelector(".popover.show") !== null;
  }

  it("shows help popover on mouse over help icon", () => {
    renderIcon();
    expect(popoverOpen()).toBeFalsy();
    fireEvent.mouseOver(icon());
    expect(popoverOpen()).toBeTruthy();
  });

  it("hides help popover on mouse out of help icon", async () => {
    renderIcon();
    fireEvent.mouseOver(icon());
    expect(popoverOpen()).toBeTruthy();
    fireEvent.mouseOut(icon());
    await waitFor(() => expect(popoverOpen()).toBeFalsy());
  });

  it("pins popover on help icon click", () => {
    renderIcon();
    expect(popoverOpen()).toBeFalsy();
    fireEvent.click(icon());
    expect(popoverOpen()).toBeTruthy();
    fireEvent.mouseOut(icon());
    expect(popoverOpen()).toBeTruthy();
  });

  it("unpins popover on repeated help icon click", async () => {
    renderIcon();
    fireEvent.click(icon());
    expect(popoverOpen()).toBeTruthy();
    fireEvent.mouseOut(icon());
    expect(popoverOpen()).toBeTruthy();
    fireEvent.click(icon());
    fireEvent.mouseOut(icon());
    await waitFor(() => expect(popoverOpen()).toBeFalsy());
  });
});
