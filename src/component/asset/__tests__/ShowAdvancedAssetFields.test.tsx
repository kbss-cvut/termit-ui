import { ShowAdvancedAssetFields } from "../ShowAdvancedAssetFields";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ShowAdvancedAssetFields", () => {
  it("is closed by default", () => {
    renderWithIntl(
      <ShowAdvancedAssetFields>
        <div data-testid="advanced-content">Test</div>
      </ShowAdvancedAssetFields>
    );
    expect(screen.getByTestId("advanced-content").parentElement).toHaveClass(
      "collapse"
    );
    expect(
      screen.getByTestId("advanced-content").parentElement
    ).not.toHaveClass("show");
  });

  it("is open upon click", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <ShowAdvancedAssetFields>
        <div data-testid="advanced-content">Test</div>
      </ShowAdvancedAssetFields>
    );
    await user.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByTestId("advanced-content").parentElement).toHaveClass(
        "collapse",
        "show"
      )
    );
  });
});
