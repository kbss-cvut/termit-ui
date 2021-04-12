import * as React from "react";

import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { UserDropdown } from "../UserDropdown";
import User from "../../../model/User";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "../../../util/Keycloak";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import * as actions from "../../../action/ComplexActions";
import ActionType from "../../../action/ActionType";

jest.mock("../../../util/Keycloak", () => ({
  init: jest.fn().mockResolvedValue({}),
  authServerUrl: "http://localhost:8080/",
  realm: "test",
  clientId: "client",
}));

describe("UserDropdown", () => {
  beforeEach(() => {
    jest
      .spyOn(actions, "logout")
      .mockReturnValue({ type: ActionType.LOGOUT } as any);
  });

  const user = new User({
    firstName: "Catherine",
    lastName: "Halsey",
    username: "halsey@unsc.org",
    iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey",
  });

  it("renders correct structure of component", () => {
    const wrapper = mountWithIntl(
      <ReactKeycloakProvider authClient={keycloak}>
        <UserDropdown dark={true} {...intlFunctions()} />
      </ReactKeycloakProvider>
    );

    expect(
      wrapper
        .find(UncontrolledDropdown)
        .find(DropdownToggle)
        .contains(
          <>
            <i className="fas fa-user-circle align-middle user-icon" />
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

  it("renders logout button as the last one in the menu", () => {
    const wrapper = mountWithIntl(
      <ReactKeycloakProvider authClient={keycloak}>
        <UserDropdown dark={true} {...intlFunctions()} />
      </ReactKeycloakProvider>
    );

    const logoutItem = wrapper.find("button#user-dropdown-logout");

    logoutItem.simulate("click");
    expect(actions.logout).toHaveBeenCalled();
  });
});
