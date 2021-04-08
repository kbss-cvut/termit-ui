import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {RouteComponentProps, withRouter} from "react-router";
import {connect} from "react-redux";
import SearchResult from "../../../model/SearchResult";
import "./Search.scss";
import * as SearchActions from "../../../action/SearchActions";
import {ThunkDispatch} from "../../../util/Types";
import TermItState from "../../../model/TermItState";
import SearchQuery from "../../../model/SearchQuery";
import SearchResults from "./SearchResults";
import ContainerMask from "../../misc/ContainerMask";
import WindowTitle from "../../misc/WindowTitle";

interface SearchProps extends HasI18n, RouteComponentProps<any> {
    addSearchListener: () => void;
    removeSearchListener: () => void;
    updateSearchFilter: (searchString: string) => any;
    searchQuery: SearchQuery;
    searchResults: SearchResult[] | null;
    searchInProgress: boolean;
}

export class Search extends React.Component<SearchProps> {
    public componentDidMount() {
        this.props.addSearchListener();
    }

    public componentWillUnmount() {
        this.props.removeSearchListener();
    }

    protected getResults() {
        return this.props.searchResults;
    }

    public render() {
        const loading = this.props.searchInProgress ? <ContainerMask /> : null;
        const results = this.getResults();

        return (
            <div className="relative">
                <WindowTitle title={this.props.i18n("search.title")} />
                {results ? <SearchResults results={results} /> : null}
                {loading}
            </div>
        );
    }
}

export default connect(
    (state: TermItState) => {
        return {
            searchQuery: state.searchQuery,
            searchResults: state.searchResults,
            searchInProgress: state.searchInProgress
        };
    },
    (dispatch: ThunkDispatch) => {
        return {
            updateSearchFilter: (searchString: string) => dispatch(SearchActions.updateSearchFilter(searchString)),
            addSearchListener: () => dispatch(SearchActions.addSearchListener()),
            removeSearchListener: () => dispatch(SearchActions.removeSearchListener())
        };
    }
)(withRouter(injectIntl(withI18n(Search))));
