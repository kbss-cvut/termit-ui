import React from "react";
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
import {useKeycloak} from "@react-keycloak/web";
import Utils from "../../util/Utils";
import { useI18n } from "../hook/useI18n";

interface UserDropdownProps {
  dark: boolean;
}

export const UserDropdown: React.FC<UserDropdownProps> = (props) => {
    const {keycloak} = useKeycloak();
    const { i18n } = useI18n();
    const user = useSelector((state: TermItState) => state.user);
    const dispatch = useDispatch();
    const onLogout = () => dispatch(logout());

    return <UncontrolledDropdown nav={true}>
        <DropdownToggle
            nav={true} caret={true}
            className={
                classNames(props.dark ? "text-white-link" : "dark-icon text-dropdown",
                    "d-flex",
                    "align-items-center",
                    "px-2",
                    "px-sm-3",
                    "py-2"
                )}>
            <i className="fas fa-user-circle align-middle user-icon"/>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-arrow" right={true}>
            <DropdownItem id="user-dropdown-profile"
                href={`${Utils.withTrailingSlash(keycloak.authServerUrl)}realms/${keycloak.realm}/account?referrer=${keycloak.clientId}`}>
                <i className="fas fa-user"/><span>{i18n("main.user-profile")}</span>
            </DropdownItem>
            <DropdownItem divider={true}/>
            <DropdownItem id="user-dropdown-logout" onClick={props.logout}>
                <i className="fas fa-sign-out-alt"/><span>{i18n("main.logout")}</span></DropdownItem>
        </DropdownMenu>
    </UncontrolledDropdown>;
};

export default UserDropdown;
