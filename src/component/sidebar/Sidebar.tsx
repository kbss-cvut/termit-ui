/*!

=========================================================
* Argon Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import { Component } from "react";
import { NavLink as NavLinkRRD } from "react-router-dom";
import {
  Collapse,
  Container,
  Form,
  Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink,
} from "reactstrap";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { RouteComponentProps, withRouter } from "react-router";
import Routes from "../../util/Routes";
import { injectIntl } from "react-intl";
import { IfGranted } from "react-authorization";
import VocabularyUtils from "../../util/VocabularyUtils";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import User from "../../model/User";
import classNames from "classnames";
import Constants from "../../util/Constants";
import { ThunkDispatch } from "../../util/Types";
import NavbarSearch from "../search/label/NavbarSearch";
import { toggleSidebar } from "../../action/SyncActions";
import UserDropdown from "../misc/UserDropdown";
import "./Sidebar.scss";
import IfUserIsEditor from "../authorization/IfUserIsEditor";

export interface SidebarProps extends HasI18n, RouteComponentProps<any> {
  user: User;
  toggleSidebar: () => void;
  sidebarExpanded: boolean;
  desktopView: boolean;
}

export interface SidebarState {
  collapseOpen: boolean;
}

export interface NavLinkRoute {
  path: string;
  name: string;
  icon: string;
  supIcon?: string;
  adminRoute?: boolean;
}

const mainNavRoutes: NavLinkRoute[] = [
  {
    path: Routes.dashboard.path,
    name: "main.nav.dashboard",
    icon: "fas fa-home",
  },
  {
    path: Routes.vocabularies.path,
    name: "main.nav.vocabularies",
    icon: "fas fa-book",
  },
  {
    path: Routes.statistics.path,
    name: "main.nav.statistics",
    icon: "fas fa-chart-pie",
  },
  {
    path: Routes.administration.path,
    name: "main.nav.admin",
    icon: "fas fa-user-shield",
    adminRoute: true,
  },
];

const createNewNavRoutes: NavLinkRoute[] = [
  {
    path: Routes.createVocabulary.path,
    name: "main.nav.create-vocabulary",
    icon: "fas fa-book",
    supIcon: "fas fa-plus",
  },
  {
    path: Routes.importVocabulary.path,
    name: "main.nav.import-vocabulary",
    icon: "fas fa-file-import",
    supIcon: "fas",
  },
];

export class Sidebar extends Component<SidebarProps, SidebarState> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      collapseOpen: false,
    };
  }

  protected activeRoute = (path: NavLinkRoute["path"]): string => {
    if (path === Routes.dashboard.path) {
      return this.props.location.pathname === Routes.dashboard.path
        ? "active"
        : "";
    }
    return this.props.location.pathname.startsWith(path) ? "active" : "";
  };

  // toggles collapse between opened and closed (mobile menu)
  protected toggleCollapse = (): void => {
    this.setState({
      collapseOpen: !this.state.collapseOpen,
    });
  };

  protected closeCollapse = (): void => {
    this.setState({
      collapseOpen: false,
    });
  };

  protected createActionLinks = (routes: NavLinkRoute[]): JSX.Element[] => {
    const { i18n, sidebarExpanded, desktopView } = this.props;
    return routes.map((route, key) => {
      return (
        <NavItem key={key}>
          <NavLink
            to={route.path}
            tag={NavLinkRRD}
            onClick={this.closeCollapse}
            activeClassName=""
            className={classNames({ "sup-icon-margin-fix": route.supIcon })}
          >
            <i className={route.icon} title={i18n(route.name)}>
              {route.supIcon && (
                <sup className={`${route.supIcon} fa-xs sup-icon`} />
              )}
            </i>
            {(sidebarExpanded || !desktopView) && i18n(route.name)}
          </NavLink>
        </NavItem>
      );
    });
  };

  protected createLinks = (routes: NavLinkRoute[]): JSX.Element[] => {
    const { i18n, sidebarExpanded, user, desktopView } = this.props;

    return routes.map((route, key) => {
      const navItem = (
        <NavItem key={key}>
          <NavLink
            to={route.path}
            tag={NavLinkRRD}
            onClick={this.closeCollapse}
            activeClassName={this.activeRoute(route.path)}
          >
            <i className={route.icon} title={i18n(route.name)} />
            {(sidebarExpanded || !desktopView) && i18n(route.name)}
          </NavLink>
        </NavItem>
      );

      if (route.adminRoute) {
        return (
          <IfGranted
            key={key}
            expected={VocabularyUtils.USER_ADMIN}
            actual={user.types}
          >
            {navItem}
          </IfGranted>
        );
      }

      return navItem;
    });
  };

  public render() {
    const { sidebarExpanded, desktopView } = this.props;

    return (
      <Navbar
        expand="md"
        id="sidenav-main"
        className={classNames(
          "navbar-vertical",
          "navbar-dark",
          "bg-dark",
          "py-md-0",
          {
            "sidebar-expanded": sidebarExpanded,
            "sidebar-collapsed": !sidebarExpanded,
          }
        )}
      >
        <Container fluid={true}>
          <div className="d-flex align-items-center header-height justify-content-between">
            {/* Toggler phone */}
            <button
              className="navbar-toggler"
              type="button"
              onClick={this.toggleCollapse}
            >
              <i className="fas fa-bars fa-lg line-height-1" />
            </button>

            {/* Brand */}
            {(sidebarExpanded || !desktopView) && (
              <NavbarBrand
                className="ml-sm-3 ml-md-0 brand ml-2 p-0"
                href={`#${Routes.dashboard.path}`}
              >
                {Constants.APP_NAME}
              </NavbarBrand>
            )}

            {/* Toggler desktop */}
            {desktopView && (
              <div
                className="menu-collapse d-inline-flex align-items-center"
                onClick={this.props.toggleSidebar}
                id="toggler"
              >
                {sidebarExpanded && <i className="fas fa-chevron-left fa-xs" />}
                <i className="fas fa-bars fa-lg line-height-1" />
                {!sidebarExpanded && (
                  <i className="fas fa-chevron-right fa-xs" />
                )}
              </div>
            )}
          </div>

          {/* User phone */}
          {!desktopView && (
            <Nav className="align-items-center" id="dropdown">
              <UserDropdown dark={true} />
            </Nav>
          )}

          {/* Collapse */}
          <Collapse
            navbar={true}
            isOpen={this.state.collapseOpen}
            className="no-before-after"
          >
            {/* Collapse header */}
            {!desktopView && (
              <div className="navbar-collapse-header d-flex justify-content-between align-items-center">
                <NavbarBrand
                  className="brand p-0"
                  href={`#${Routes.dashboard.path}`}
                >
                  {Constants.APP_NAME}
                </NavbarBrand>

                {/* Close button X */}
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={this.toggleCollapse}
                >
                  <span />
                  <span />
                </button>
              </div>
            )}

            {/* Search mobile */}
            {!desktopView && (
              <Form className="mt-4 mb-3">
                <NavbarSearch
                  navbar={false}
                  closeCollapse={this.closeCollapse}
                />
              </Form>
            )}

            <hr className="mb-2 mt-0" />

            <Nav navbar={true}>{this.createLinks(mainNavRoutes)}</Nav>

            {desktopView && (
              <IfUserIsEditor>
                <div className="d-block">
                  <hr className="mb-2 mt-2" />
                  <Nav navbar={true}>
                    {this.createActionLinks(createNewNavRoutes)}
                  </Nav>
                </div>
              </IfUserIsEditor>
            )}
          </Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      user: state.user,
      sidebarExpanded: state.sidebarExpanded,
      desktopView: state.desktopView,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      toggleSidebar: () => dispatch(toggleSidebar()),
    };
  }
)(injectIntl(withI18n(withRouter(Sidebar))));
