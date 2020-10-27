import * as React from "react";
import {Nav, Navbar, NavbarBrand} from "reactstrap";
import classNames from "classnames";
import NavbarSearch from "../search/label/NavbarSearch";
import UserDropdown from "../misc/UserDropdown";
import {Breadcrumbs} from "react-breadcrumbs";
import User, {EMPTY_USER} from "../../model/User";
import TermItState from "../../model/TermItState";
import {connect} from "react-redux";
import Workspace from "../../model/Workspace";
import Routes from "../../util/Routes";
import Constants from "../../util/Constants";
import WorkspaceIndicator from "../workspace/WorkspaceIndicator";

interface HeaderProps {
    showBreadcrumbs: boolean;

    desktopView: boolean;
    user: User;
    workspace?: Workspace | null;
}

export const Header: React.FC<HeaderProps> = props => {
    const {showBreadcrumbs, desktopView, user, workspace} = props;
    const isLoggedIn = user !== EMPTY_USER;
    const brand = (!isLoggedIn || !workspace) && <NavbarBrand
        className="p-0 ml-2 ml-sm-3 ml-md-0 brand" href={`#${Routes.dashboard.path}`}>
        {Constants.APP_NAME}
    </NavbarBrand>;

    return <header>
        {desktopView && <Navbar id="navbar"
                                light={true} fixed="top"
                                className={classNames("bg-white", "navbar-top", "d-flex")}>
            {brand}
            <Nav navbar={true} className="nav-search">
                {isLoggedIn && workspace && <NavbarSearch navbar={true}/>}
            </Nav>
            <Nav navbar={true} className="workspace-indicator">
                {workspace && <WorkspaceIndicator/>}
            </Nav>
            <Nav navbar={true} className="nav-menu-user flex-row-reverse">
                {isLoggedIn && <UserDropdown dark={false}/>}
            </Nav>
        </Navbar>}

        {showBreadcrumbs && <Breadcrumbs className="breadcrumb-bar" separator="/"/>}
    </header>;
}

export default connect((state: TermItState) => ({
    desktopView: state.desktopView,
    user: state.user,
    workspace: state.workspace
}))(Header);
