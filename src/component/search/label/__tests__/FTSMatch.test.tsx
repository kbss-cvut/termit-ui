import FTSMatch from "../FTSMatch";
import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import { screen } from "@testing-library/react";

describe("FTSMatch", () => {
  it("renders match as element with highlighting class and match content", () => {
    const snippet = "<em>Match</em> text";
    const { container } = renderWithIntl(<FTSMatch match={snippet} />);
    expect(
      container.querySelectorAll(".search-result-snippet-match")
    ).toHaveLength(1);
    expect(screen.getByText("Match")).toHaveClass(
      "search-result-snippet-match"
    );
  });

  it("renders multiple matches as elements with highlighting class", () => {
    const snippet = "<em>Match</em> text and another <em>match</em> here";
    const { container } = renderWithIntl(<FTSMatch match={snippet} />);
    expect(
      container.querySelectorAll(".search-result-snippet-match")
    ).toHaveLength(2);
  });
});
