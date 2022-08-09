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
import SearchResult from "../../../model/SearchResult";
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

interface NavbarSearchProps extends HasI18n, RouteComponentProps<any> {
  updateSearchFilter: (searchString: string) => any;
  searchString: string;
  searchResults: SearchResult[] | null;
  navbar: boolean;
  closeCollapse?: () => void;
  user: User;
}

interface NavbarSearchState {
  showResults: boolean;
  searchOriginNavbar?: boolean;
}

/**
 * Routes for which the results results preview popup should not be displayed.
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
    const value = e.target.value;
    this.closeResults();
    this.props.updateSearchFilter(value).then(() =>
      this.setState({
        showResults: true,
        searchOriginNavbar: this.props.navbar,
      })
    );
  };

  private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      this.openSearchView();
    }
  };

  private openSearchView = () => {
    const query = new Map();
    const searchString = this.props.searchString.trim();
    if (searchString.length > 0) {
      query.set("searchString", encodeURI(searchString));
    }
    this.closeResults();
    Routing.transitionTo(
      isLoggedIn(this.props.user) ? Routes.search : Routes.publicSearch,
      { query }
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

  public render() {
    const { i18n, navbar } = this.props;

    const searchIcon = (
      <InputGroupAddon addonType="prepend" id="icon">
        <InputGroupText>
          <span className="fas fa-search" />
        </InputGroupText>
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
      <div className={classNames({ search: navbar }, "flex-grow-1")}>
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
          {!navbar && searchIcon}
          {this.props.searchString && clearIcon}
        </InputGroup>
        {this.renderResultsOverlay()}
      </div>
    );
  }

  protected resetSearch = () => {
    this.props.updateSearchFilter("");
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
        updateSearchFilter: (searchString: string) =>
          dispatch(updateSearchFilter(searchString)),
      };
    }
  )(injectIntl(withI18n(NavbarSearch)))
);
