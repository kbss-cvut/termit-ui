import * as React from "react";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Tabs from "../Tabs";
import { fireEvent } from "@testing-library/react";

const Component: React.FC = () => <div>Test</div>;

describe("Tabs Test", () => {
  let change: () => void;

  beforeEach(() => {
    change = vi.fn();
    mockUseI18n();
  });

  function renderTabs() {
    return renderWithIntl(
      <Tabs
        activeTabLabelKey="edit"
        tabs={{ edit: <Component />, save: <Component /> }}
        changeTab={change}
      />
    );
  }

  it("Tab container contains correct number of tabs", () => {
    const { container } = renderTabs();
    expect(container.querySelectorAll(".nav-link").length).toEqual(2);
  });

  it("Change action called upon non-active tab clicked", () => {
    const { container } = renderTabs();
    fireEvent.click(container.querySelectorAll(".nav-link")[1]);
    expect(change).toHaveBeenCalled();
  });

  it("Change action not called upon active tab clicked", () => {
    const { container } = renderTabs();
    fireEvent.click(container.querySelectorAll(".nav-link")[0]);
    expect(change).not.toHaveBeenCalled();
  });
});
