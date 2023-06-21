import * as React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import Utils from "../../util/Utils";
import classNames from "classnames";
import { Container, Nav, Navbar, NavItem } from "reactstrap";
import Messages from "../message/Messages";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import Routes from "../../util/Routes";
import Footer from "../footer/Footer";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { ThunkDispatch } from "../../util/Types";
import { changeView } from "../../action/SyncActions";
import { injectIntl } from "react-intl";
import withLoading from "../hoc/withLoading";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import { FaUserSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import VocabularyManagementRoute from "./vocabulary/VocabularyManagementRoute";
import SearchTypeTabs from "../search/SearchTypeTabs";
import NavbarSearch from "../search/label/NavbarSearch";
import SearchTerms from "../search/SearchTerms";
import SearchVocabularies from "../search/SearchVocabularies";
import Search from "../search/label/Search";
import "../MainView.scss";
import { loadConfiguration } from "../../action/AsyncActions";
import Breadcrumbs from "../breadcrumb/Breadcrumbs";
import FacetedSearch from "../search/facet/FacetedSearch";

interface MainViewProps extends HasI18n, RouteComponentProps<any> {
  sidebarExpanded: boolean;
  desktopView: boolean;
  changeView: () => void;
  loadConfiguration: () => void;
}

interface MainViewState {
  isMainMenuOpen: boolean;
}

export class MainView extends React.Component<MainViewProps, MainViewState> {
  constructor(props: MainViewProps) {
    super(props);
    this.state = {
      isMainMenuOpen: false,
    };
  }

  public componentDidMount(): void {
    window.addEventListener("resize", this.handleResize, false);
    this.props.loadConfiguration();
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.handleResize, false);
  }

  private handleResize = (): void => {
    if (Utils.isDesktopView() !== this.props.desktopView) {
      this.props.changeView();
    }
  };

  public toggle = () => {
    this.setState({
      isMainMenuOpen: !this.state.isMainMenuOpen,
    });
  };

  private isDashboardRoute() {
    return this.props.location.pathname === Routes.publicDashboard.path;
  }

  public render() {
    const { i18n, sidebarExpanded, desktopView } = this.props;

    return (
      <div className="main-container">
        <Sidebar />
        <div
          className={classNames(
            {
              "main-view-sidebar-expanded": sidebarExpanded,
              "main-view-sidebar-collapsed": !sidebarExpanded,
            },
            "flex-grow-1"
          )}
        >
          <header>
            {desktopView && (
              <Navbar
                id="navbar"
                light={true}
                fixed="top"
                className={classNames("bg-white", "navbar-top", "d-flex")}
              >
                <Nav navbar={true} className="nav-search">
                  <NavbarSearch navbar={true} />
                </Nav>
                <Nav navbar={true} className="nav-menu-user flex-row-reverse">
                  <NavItem>
                    <Link
                      to={Routes.login.path}
                      className="text-dark mx-3"
                      title={i18n("public.nav.user")}
                    >
                      <FaUserSlash className="user-icon" />
                    </Link>
                  </NavItem>
                </Nav>
              </Navbar>
            )}

            {!this.isDashboardRoute() && (
              <Breadcrumbs className="breadcrumb-bar" separator="/" />
            )}
          </header>
          <SearchTypeTabs />
          <Messages />
          <Container
            id="content-container"
            fluid={true}
            className={classNames("pt-3", "flex-grow-1", {
              "content-container-dashboard": this.isDashboardRoute(),
            })}
          >
            <Switch>
              <BreadcrumbRoute
                title={i18n("main.nav.vocabularies")}
                path={Routes.publicVocabularies.path}
                component={VocabularyManagementRoute}
              />
              <BreadcrumbRoute
                title={i18n("main.nav.searchTerms")}
                path={Routes.publicSearchTerms.path}
                component={SearchTerms}
              />
              <BreadcrumbRoute
                title={i18n("main.nav.searchVocabularies")}
                path={Routes.publicSearchVocabularies.path}
                component={SearchVocabularies}
              />
              <BreadcrumbRoute
                title={i18n("main.nav.facetedSearch")}
                path={Routes.publicFacetedSearch.path}
                component={FacetedSearch}
              />
              <BreadcrumbRoute
                title={i18n("main.nav.search")}
                path={Routes.publicSearch.path}
                component={Search}
              />
              <Route component={Dashboard} />
            </Switch>
          </Container>
        </div>
        <Footer authenticated={false} sidebarExpanded={sidebarExpanded} />
      </div>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      loading: state.loading,
      intl: state.intl, // Pass intl in props to force UI re-render on language switch
      sidebarExpanded: state.sidebarExpanded,
      desktopView: state.desktopView,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      changeView: () => dispatch(changeView()),
      loadConfiguration: () => dispatch(loadConfiguration()),
    };
  }
)(
  injectIntl(
    withI18n(
      withLoading(withRouter(MainView), { containerClass: "app-container" })
    )
  )
);
