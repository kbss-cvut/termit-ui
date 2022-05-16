import { UserDropdown } from "../UserDropdown";
import User from "../../../model/User";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import * as Redux from "react-redux";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import * as actions from "../../../action/ComplexActions";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("UserDropdown", () => {
  const user = new User({
    firstName: "Catherine",
    lastName: "Halsey",
    username: "halsey@unsc.org",
    iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey",
  });

  beforeEach(() => {
    (Redux.useSelector as jest.Mock).mockReturnValue(user);
    jest.spyOn(actions, "logout");
  });

  it("renders correct structure of component", () => {
    const wrapper = mountWithIntl(<UserDropdown dark={true} />);

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
