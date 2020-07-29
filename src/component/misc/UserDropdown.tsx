import React from "react";
import {
    DropdownMenu, DropdownItem, UncontrolledDropdown, DropdownToggle,
} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes from "../../util/Routes";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import classNames from "classnames";
import TermItState from "../../model/TermItState";
import {ThunkDispatch} from "../../util/Types";
import * as actions from "../../action/ComplexActions";
import User from "../../model/User";
import "./UserDropdown.scss";

interface UserDropdownProps extends HasI18n {
    user: User;
    logout: () => void;
    dark: boolean;
}

/**
 * Have to explicitly add the hash to NavLink paths, otherwise NavLinks act as if using browser history.
 */
function hashPath(path: string): string {
    return "#" + path;
}

export const UserDropdown: React.FC<UserDropdownProps> = (props) => (
    <UncontrolledDropdown nav={true}>
        <DropdownToggle
            nav={true} caret={true}
            className={
                classNames(props.dark ? "text-white-link" : "text-dark text-dropdown",
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
            <DropdownItem
                href={hashPath(Routes.profile.path)}><i
                className="fas fa-user"/><span>{props.i18n("main.user-profile")}</span></DropdownItem>
            <DropdownItem divider={true}/>
            <DropdownItem onClick={props.logout}><i
                className="fas fa-sign-out-alt"/><span>{props.i18n("main.logout")}</span></DropdownItem>
        </DropdownMenu>
    </UncontrolledDropdown>
);

export default connect((state: TermItState) => {
    return {
        user: state.user
    };
}, (dispatch: ThunkDispatch) => {
    return {
        logout: () => dispatch(actions.logout())
    };
})(injectIntl(withI18n(UserDropdown)));


