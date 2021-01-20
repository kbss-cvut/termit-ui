import React from "react";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown,} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import classNames from "classnames";
import TermItState from "../../model/TermItState";
import {ThunkDispatch} from "../../util/Types";
import * as actions from "../../action/ComplexActions";
import User from "../../model/User";
import "./UserDropdown.scss";
import {useKeycloak} from "@react-keycloak/web";

interface UserDropdownProps extends HasI18n {
    user: User;
    logout: () => void;
    dark: boolean;
}

export const UserDropdown: React.FC<UserDropdownProps> = (props) => {
    const {keycloak} = useKeycloak();

    return <UncontrolledDropdown nav={true}>
        <DropdownToggle
            nav={true} caret={true}
            className={
                classNames(props.dark ? "text-white-link" : "dark-icon text-dropdown",
                    "d-flex",
                    "align-items-center",
                    "px-2",
                    "px-sm-3"
                )}>
            <i className="fas fa-user-circle align-middle user-icon"/>
            &nbsp;
            <span className="user-dropdown">{props.user.abbreviatedName}</span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-arrow" right={true}>
            <DropdownItem id="user-dropdown-profile"
                href={`${keycloak.authServerUrl}/realms/${keycloak.realm}/account?referrer=${keycloak.clientId}`}>
                <i className="fas fa-user"/><span>{props.i18n("main.user-profile")}</span>
            </DropdownItem>
            <DropdownItem divider={true}/>
            <DropdownItem id="user-dropdown-logout" onClick={props.logout}>
                <i className="fas fa-sign-out-alt"/><span>{props.i18n("main.logout")}</span></DropdownItem>
        </DropdownMenu>
    </UncontrolledDropdown>;
}

export default connect((state: TermItState) => {
    return {
        user: state.user
    };
}, (dispatch: ThunkDispatch) => {
    return {
        logout: () => dispatch(actions.logout())
    };
})(injectIntl(withI18n(UserDropdown)));


