import { UserDropdown } from "../UserDropdown";
import User from "../../../model/User";
import * as Redux from "react-redux";
import {
  renderWithIntl,
  withWebSocket,
} from "../../../__tests__/environment/Environment";
import * as actions from "../../../action/ComplexActions";
import type { Mock } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

describe("UserDropdown", () => {
  const user = new User({
    firstName: "Catherine",
    lastName: "Halsey",
    username: "halsey@unsc.org",
    iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey",
  });

  beforeEach(() => {
    (Redux.useSelector as Mock).mockReturnValue(user);
    vi.spyOn(actions, "logout");
  });

  it("renders correct structure of component", () => {
    const { container } = renderWithIntl(
      withWebSocket(<UserDropdown dark={true} />)
    );

    expect(
      container.querySelector("i.fas.fa-user-circle.user-icon")
    ).toBeInTheDocument();
    expect(container.querySelector(".user-dropdown")).toHaveTextContent(
      user.abbreviatedName!
    );

    // Two menu items and a divider
    expect(
      container.querySelectorAll(".dropdown-menu .dropdown-item").length
    ).toBe(2);
    expect(
      container.querySelectorAll(".dropdown-menu .dropdown-divider").length
    ).toBe(1);
  });
});
