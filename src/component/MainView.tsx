import * as React from "react";
import classNames from "classnames";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "./hoc/withI18n";
import withLoading from "./hoc/withLoading";
import {connect} from "react-redux";
import TermItState from "../model/TermItState";
import {
    Container,
    Jumbotron,
    Nav,
    Navbar,
} from "reactstrap";
import User, {EMPTY_USER} from "../model/User";
import "./MainView.scss";
import Routes from "../util/Routes";
import Footer from "./footer/Footer";
import {logout} from "../action/ComplexActions";
import {Route, RouteComponentProps, Switch, withRouter} from "react-router";
import Messages from "./message/Messages";
import Statistics from "./statistics/Statistics";
import NavbarSearch from "./search/label/NavbarSearch";
import Search from "./search/label/Search";
import {ThunkDispatch} from "../util/Types";
import ResourceManagementRoute from "./resource/ResourceManagementRoute";
import SearchTypeTabs from "./search/SearchTypeTabs";
import SearchTerms from "./search/SearchTerms";
import {Breadcrumbs} from "react-breadcrumbs";
import BreadcrumbRoute from "./breadcrumb/BreadcrumbRoute";
import VocabularyManagementRoute from "./vocabulary/VocabularyManagementRoute";
import Dashboard from "./dashboard/Dashboard";
import SearchVocabularies from "./search/SearchVocabularies";
import ProfileRoute from "./profile/ProfileRoute";
import VocabularyUtils, {IRI} from "../util/VocabularyUtils";
import AdministrationRoute from "./administration/AdministrationRoute";
import {loadUser} from "../action/AsyncUserActions";
import Sidebar from "./sidebar/Sidebar";
import UserDropdown from "./misc/UserDropdown";
import {changeView} from "../action/SyncActions";
import Utils from "../util/Utils";
import {loadCurrentWorkspace, selectWorkspace} from "../action/WorkspaceAsyncActions";
import Workspace from "../model/Workspace";

interface MainViewProps extends HasI18n, RouteComponentProps<any> {
    user: User;
    workspace?: Workspace | null;
    loadUser: () => Promise<any>;
    logout: () => void;
    selectWorkspace: (iri: IRI) => void;
    loadCurrentWorkspace: () => void;
    sidebarExpanded: boolean;
    desktopView: boolean;
    changeView: () => void;
}

interface MainViewState {
    isMainMenuOpen: boolean;
}

export class MainView extends React.Component<MainViewProps, MainViewState> {

    public static defaultProps: Partial<MainViewProps> = {};

    constructor(props: MainViewProps) {
        super(props);
        this.state = {
            isMainMenuOpen: false
        };
    }

    public componentDidMount(): void {
        if (this.props.user === EMPTY_USER) {
            this.props.loadUser().then(() => this.loadWorkspace());
        } else {
            this.loadWorkspace();
        }

        window.addEventListener("resize", this.handleResize, false);
    }

    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.handleResize, false);
    }

    private loadWorkspace() {
        if (this.props.user === EMPTY_USER) {
            return;
        }
        let ws = Utils.extractQueryParam(this.props.location.search, "workspace");
        if (ws) {
            ws = decodeURIComponent(ws);
            this.props.selectWorkspace(VocabularyUtils.create(ws));
        } else {
            this.props.loadCurrentWorkspace();
        }
    }

    private handleResize = (): void => {

        if (Utils.isDesktopView() !== this.props.desktopView) {
            this.props.changeView();
        }
    };

    public toggle = () => {
        this.setState({
            isMainMenuOpen: !this.state.isMainMenuOpen
        });
    };

    private isDashboardRoute() {
        return this.props.location.pathname === Routes.dashboard.path;
    }

    public render() {
        const {i18n, user, sidebarExpanded, desktopView} = this.props;

        if (user === EMPTY_USER) {
            return this.renderPlaceholder();
        }

        return <div className="main-container">
            <Sidebar/>
            <div className={classNames({
                "main-view-sidebar-expanded": sidebarExpanded,
                "main-view-sidebar-collapsed": !sidebarExpanded
            }, "flex-grow-1")}>
                <header>
                    {desktopView && <Navbar id="navbar"
                                            light={true} fixed="top"
                                            className={classNames("bg-white", "navbar-top", "d-flex")}>
                        <Nav navbar={true} className="nav-search">
                            <NavbarSearch navbar={true}/>
                        </Nav>

                        <Nav navbar={true} className="nav-menu-user flex-row-reverse">
                            <UserDropdown dark={false}/>
                        </Nav>
                    </Navbar>}

                    {/*
                        // @ts-ignore */}
                    {!this.isDashboardRoute() && <Breadcrumbs className="breadcrumb-bar" separator="/"/>}

                </header>
                <SearchTypeTabs/>
                <Messages/>
                <Container id="content-container" fluid={true}
                           className={
                               classNames("pt-3", "flex-grow-1",
                                   {"content-container-dashboard": this.isDashboardRoute()})
                           }>
                    <Switch>
                        <BreadcrumbRoute title={i18n("main.nav.admin")} path={Routes.administration.path}
                                         component={AdministrationRoute}/>
                        <BreadcrumbRoute title={i18n("main.nav.resources")} path={Routes.resources.path}
                                         component={ResourceManagementRoute}/>
                        <BreadcrumbRoute title={i18n("main.nav.vocabularies")} path={Routes.vocabularies.path}
                                         component={VocabularyManagementRoute}/>
                        <BreadcrumbRoute title={i18n("main.nav.statistics")} path={Routes.statistics.path}
                                         component={Statistics}/>
                        <BreadcrumbRoute title={i18n("main.nav.searchTerms")} path={Routes.searchTerms.path}
                                         component={SearchTerms}/>
                        <BreadcrumbRoute title={i18n("main.nav.searchVocabularies")}
                                         path={Routes.searchVocabularies.path}
                                         component={SearchVocabularies}/>
                        <BreadcrumbRoute title={i18n("main.nav.search")} path={Routes.search.path} component={Search}/>
                        <BreadcrumbRoute title={i18n("main.user-profile")} path={Routes.profile.path}
                                         component={ProfileRoute}/>
                        <Route component={Dashboard}/>
                    </Switch>
                </Container>
            </div>
            <Footer authenticated={true} sidebarExpanded={sidebarExpanded}/>
        </div>;
    }

    private renderPlaceholder() {
        return <div id="loading-placeholder" className="wrapper center">
            <Jumbotron>
                <h1>{this.props.i18n("message.welcome")}</h1>
            </Jumbotron>
        </div>;
    }
}

export default connect((state: TermItState) => {
    return {
        loading: state.loading,
        user: state.user,
        workspace: state.workspace,
        intl: state.intl,    // Pass intl in props to force UI re-render on language switch
        sidebarExpanded: state.sidebarExpanded,
        desktopView: state.desktopView
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadUser: () => dispatch(loadUser()),
        logout: () => dispatch(logout()),
        changeView: () => dispatch(changeView()),
        selectWorkspace: (iri: IRI) => dispatch(selectWorkspace(iri)),
        loadCurrentWorkspace: () => dispatch(loadCurrentWorkspace())
    };
})(injectIntl(withI18n(withLoading(withRouter(MainView), {containerClass: "app-container"}))));
