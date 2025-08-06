import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../../hoc/withI18n";
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import SearchResult from "../../../model/search/SearchResult";
import { connect } from "react-redux";
import { updateSearchFilter } from "../../../action/SearchActions";
import SearchResultsOverlay from "./SearchResultsOverlay";
import Routes from "../../../util/Routes";
import { ThunkDispatch } from "../../../util/Types";
import TermItState from "../../../model/TermItState";
import Routing from "../../../util/Routing";
import { RouteComponentProps, withRouter } from "react-router";
import classNames from "classnames";
import User from "../../../model/User";
import { FaTimes } from "react-icons/fa";
import "./NavbarSearch.scss";
import { isLoggedIn } from "../../../util/Authorization";
import LanguageSelector from "../../resource/file/LanguageSelector";

interface NavbarSearchProps extends HasI18n, RouteComponentProps<any> {
  updateSearchFilter: (searchString: string, language: string) => any;
  searchString: string;
  searchResults: SearchResult[] | null;
  navbar: boolean;
  closeCollapse?: () => void;
  user: User;
}

interface NavbarSearchState {
  showResults: boolean;
  searchOriginNavbar?: boolean;
  selectedLanguage: string;
}

/**
 * Routes for which the results preview popup should not be displayed.
 */
const ROUTES_WITHOUT_SEARCH_OVERLAY = [
  Routes.search,
  Routes.searchTerms,
  Routes.searchVocabularies,
  Routes.facetedSearch,
  Routes.publicSearch,
  Routes.publicSearchTerms,
  Routes.publicSearchVocabularies,
];

export class NavbarSearch extends React.Component<
  NavbarSearchProps,
  NavbarSearchState
> {
  constructor(props: NavbarSearchProps) {
    super(props);
    this.state = {
      showResults: false,
      selectedLanguage: "",
    };
  }

  public componentDidUpdate(prevProps: Readonly<NavbarSearchProps>): void {
    // Hide results when transitioning to a different route
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.closeResults();
      if (this.props.closeCollapse) {
        this.props.closeCollapse();
      }
    }
    document.addEventListener("keydown", this.onKeyDownActions, false);
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDownActions, false);
  }

  private onKeyDownActions = (e: KeyboardEvent): void => {
    if (e.key === "Escape" || e.key === "Esc") {
      // escape
      this.closeResults();
    }
  };

  public onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.doSearch(e.target.value, this.state.selectedLanguage);
  };

  private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      this.openSearchView();
    }
  };

  private openSearchView = () => {
    this.closeResults();
    Routing.transitionTo(
      isLoggedIn(this.props.user) ? Routes.search : Routes.publicSearch
    );
  };

  private closeResults = () => {
    this.setState({ showResults: false, searchOriginNavbar: undefined });
  };

  private shouldDisplayResults() {
    const path = this.props.location.pathname;
    return (
      this.state.showResults &&
      !ROUTES_WITHOUT_SEARCH_OVERLAY.find((r) => r.path === path)
    );
  }

  public onOpenSearch = () => {
    Routing.transitionTo(
      isLoggedIn(this.props.user) ? Routes.search : Routes.publicSearch
    );
  };

  public onOpenFacetedSearch = () => {
    Routing.transitionTo(
      isLoggedIn(this.props.user)
        ? Routes.facetedSearch
        : Routes.publicFacetedSearch
    );
  };

  private onLanguageSelectChange = (langCode: string) => {
    this.setState({ selectedLanguage: langCode });
    this.doSearch(this.props.searchString, langCode);
  };

  private doSearch = (searchString: string, language: string) => {
    this.closeResults();
    this.props.updateSearchFilter(searchString, language).then(() => {
      const path = this.props.location.pathname;
      if (
        path.endsWith(Routes.publicFacetedSearch.path) ||
        path.endsWith(Routes.facetedSearch.path)
      ) {
        this.openSearchView();
      }
      this.setState({
        showResults: true,
        searchOriginNavbar: this.props.navbar,
      });
    });
  };

  public render() {
    const { i18n, navbar } = this.props;

    const searchIcon = (
      <InputGroupAddon
        addonType="prepend"
        id="search-icon"
        title={i18n("main.search.tooltip")}
        className="search-icon"
        onClick={this.onOpenSearch}
      >
        <InputGroupText>
          <span className="fas fa-search" />
        </InputGroupText>
      </InputGroupAddon>
    );

    const languageSelect = (
      <InputGroupAddon addonType={"append"}>
        <LanguageSelector
          className={"navbar-search-language-select"}
          onChange={this.onLanguageSelectChange}
          value={this.state.selectedLanguage}
          isClearable={true}
        />
      </InputGroupAddon>
    );

    const clearIcon = (
      <InputGroupAddon
        addonType="append"
        id="search-reset"
        onClick={this.resetSearch}
        className="float-right"
      >
        <Button
          title={this.props.i18n("search.reset")}
          color="outline-dark"
          style={{ zIndex: 5 }}
        >
          <FaTimes style={{ marginBottom: 4 }} />
        </Button>
      </InputGroupAddon>
    );

    return (
      <div
        className={classNames(
          {
            search: navbar,
            "navbar-search-margin-right-4": !this.props.searchString,
          },
          "flex-grow-1"
        )}
      >
        <InputGroup className="input-group-rounded input-group-merge">
          {navbar && searchIcon}
          <Input
            aria-label="Search"
            className="form-control-rounded form-control-prepended"
            placeholder={i18n("main.search.placeholder")}
            type="search"
            id={`main-search-input${navbar ? "-navbar" : ""}`}
            autoFocus={true}
            autoComplete="off"
            value={this.props.searchString}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
          />
          {languageSelect}
          {!navbar && searchIcon}
          {this.props.searchString && clearIcon}
        </InputGroup>
        {this.renderResultsOverlay()}
      </div>
    );
  }

  protected resetSearch = () => {
    this.props.updateSearchFilter("", "");
    this.setState({ selectedLanguage: "" });
  };

  private renderResultsOverlay() {
    const { searchResults, navbar } = this.props;

    if (searchResults && this.state.searchOriginNavbar === navbar) {
      return (
        <SearchResultsOverlay
          show={this.shouldDisplayResults()}
          searchResults={searchResults}
          onClose={this.closeResults}
          targetId={`main-search-input${navbar ? "-navbar" : ""}`}
          onOpenSearch={this.openSearchView}
          onOpenFacetedSearch={this.onOpenFacetedSearch}
        />
      );
    }

    return null;
  }
}

export default withRouter(
  connect(
    (state: TermItState) => {
      return {
        searchString: state.searchQuery.searchQuery,
        searchResults: state.searchResults,
        intl: state.intl, // Pass intl in props to force UI re-render on language switch
        user: state.user,
      };
    },
    (dispatch: ThunkDispatch) => {
      return {
        updateSearchFilter: (searchString: string, language: string) =>
          dispatch(updateSearchFilter(searchString, language)),
      };
    }
  )(injectIntl(withI18n(NavbarSearch)))
);
