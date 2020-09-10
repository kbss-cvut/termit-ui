import * as React from "react";
import {Nav, Navbar} from "reactstrap";
import classNames from "classnames";
import NavbarSearch from "../search/label/NavbarSearch";
import UserDropdown from "../misc/UserDropdown";
import {Breadcrumbs} from "react-breadcrumbs";
import User, {EMPTY_USER} from "../../model/User";
import TermItState from "../../model/TermItState";
import {connect} from "react-redux";

interface HeaderProps {
    showBreadcrumbs: boolean;

    desktopView: boolean;
    user: User;
}

export const Header: React.FC<HeaderProps> = props => {
    const {showBreadcrumbs, desktopView, user} = props;
    const isLoggedIn = user !== EMPTY_USER;

    return <header>
        {desktopView && <Navbar id="navbar"
                                light={true} fixed="top"
                                className={classNames("bg-white", "navbar-top", "d-flex")}>
            <Nav navbar={true} className="nav-search">
                {isLoggedIn && <NavbarSearch navbar={true}/>}
            </Nav>

            <Nav navbar={true} className="nav-menu-user flex-row-reverse">
                {isLoggedIn && <UserDropdown dark={false}/>}
            </Nav>
        </Navbar>}

        {}
        {showBreadcrumbs && <Breadcrumbs className="breadcrumb-bar" separator="/"/>}
    </header>;
}

export default connect((state: TermItState) => ({desktopView: state.desktopView, user: state.user}))(Header);
