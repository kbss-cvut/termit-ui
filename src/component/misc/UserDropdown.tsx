import * as React from "react";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import Routes from "../../util/Routes";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import TermItState from "../../model/TermItState";
import { logout } from "../../action/ComplexActions";
import "./UserDropdown.scss";
import { useI18n } from "../hook/useI18n";
import { ThunkDispatch } from "../../util/Types";
import { useContext } from "react";
import { AuthContext } from "./oidc/OidcAuthWrapper";
import { useStompClient } from "react-stomp-hooks";

interface UserDropdownProps {
  dark: boolean;
}

/**
 * Have to explicitly add the hash to NavLink paths, otherwise NavLinks act as if using browser history.
 */
function hashPath(path: string): string {
  return "#" + path;
}

export const UserDropdown: React.FC<UserDropdownProps> = (props) => {
  const { i18n } = useI18n();
  const user = useSelector((state: TermItState) => state.user);
  const dispatch: ThunkDispatch = useDispatch();
  const context = useContext(AuthContext);
  const stompClient = useStompClient();
  const onLogout = async () => {
    if (context && context.logout) {
      await context.logout();
    }
    dispatch(logout(stompClient));
  };
  return (
    <UncontrolledDropdown nav={true}>
      <DropdownToggle
        nav={true}
        caret={true}
        className={classNames(
          props.dark ? "text-white-link" : "text-dark text-dropdown",
          "d-flex",
          "align-items-center",
          "px-2",
          "px-sm-3"
        )}
      >
        <i className="fas fa-user-circle user-icon align-middle" />
        &nbsp;
        <span className="user-dropdown">{user.abbreviatedName}</span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-arrow" right={true}>
        <DropdownItem href={hashPath(Routes.profile.path)}>
          <i className="fas fa-user" />
          <span>{i18n("main.user-profile")}</span>
        </DropdownItem>
        <DropdownItem divider={true} />
        <DropdownItem onClick={onLogout}>
          <i className="fas fa-sign-out-alt" />
          <span>{i18n("main.logout")}</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default UserDropdown;
