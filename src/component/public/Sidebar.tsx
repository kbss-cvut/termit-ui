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
import withI18n from "../hoc/withI18n";
import { withRouter } from "react-router";
import Routes from "../../util/Routes";
import { Collapse, Container, Nav, Navbar, NavbarBrand } from "reactstrap";
import classNames from "classnames";
import Constants, { getEnv } from "../../util/Constants";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { ThunkDispatch } from "../../util/Types";
import { toggleSidebar } from "../../action/SyncActions";
import { injectIntl } from "react-intl";
import {
  NavLinkRoute,
  Sidebar as DefaultSidebar,
  SidebarProps,
} from "../sidebar/Sidebar";
import "../sidebar/Sidebar.scss";
import ConfigParam from "../../util/ConfigParam";

const mainNavRoutes: NavLinkRoute[] = [
  {
    path: Routes.publicVocabularies.path,
    name: "main.nav.vocabularies",
    icon: "fas fa-book",
  },
  {
    path: Routes.publicFacetedSearch.path,
    name: "main.nav.facetedSearch",
    icon: "fas fa-search-plus",
  },
];

const actionNavRoutes: NavLinkRoute[] = [
  {
    path: Routes.login.path,
    name: "login.submit",
    icon: "fas fa-user",
  },
];

if (
  getEnv(ConfigParam.ADMIN_REGISTRATION_ONLY, "") !== true.toString() &&
  getEnv(ConfigParam.AUTH_TYPE, "") !== "oidc"
) {
  actionNavRoutes.push({
    path: Routes.register.path,
    name: "register.submit",
    icon: "fas fa-user",
    supIcon: "fas fa-plus",
  });
}

export class Sidebar extends DefaultSidebar {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      collapseOpen: false,
    };
  }

  protected activeRoute = (path: NavLinkRoute["path"]): string => {
    if (path === Routes.publicDashboard.path) {
      return this.props.location.pathname === Routes.publicDashboard.path
        ? "active"
        : "";
    }
    return this.props.location.pathname.startsWith(path) ? "active" : "";
  };

  public render() {
    const { i18n, sidebarExpanded, desktopView } = this.props;

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
                href={`#${Routes.publicDashboard.path}`}
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
                  href={`#${Routes.publicDashboard.path}`}
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

            <hr className="mb-3 mt-0" />

            <Nav navbar={true}>{this.createLinks(mainNavRoutes)}</Nav>

            {desktopView && (
              <div className="d-block">
                <hr className="mb-3 mt-0" />
                {sidebarExpanded && (
                  <h6 className="navbar-heading text-muted">
                    {i18n("actions")}
                  </h6>
                )}
                <Nav navbar={true}>
                  {this.createActionLinks(actionNavRoutes)}
                </Nav>
              </div>
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
      user: state.user, // Not needed by this class, just to conform to superclass signature
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
