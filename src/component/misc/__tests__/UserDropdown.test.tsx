import { UserDropdown } from "../UserDropdown";
import User from "../../../model/User";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import * as Redux from "react-redux";
import {
  mountWithIntl,
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
    const wrapper = mountWithIntl(withWebSocket(<UserDropdown dark={true} />));

    expect(
      wrapper
        .find(UncontrolledDropdown)
        .find(DropdownToggle)
        .contains(
          <>
            <i className="fas fa-user-circle user-icon align-middle" />
            &nbsp;
            <span className="user-dropdown">{user.abbreviatedName}</span>
          </>
        )
    );

    expect(
      wrapper.find(UncontrolledDropdown).find(DropdownMenu).find(DropdownItem)
        .length
    ).toBe(3);
  });
});
