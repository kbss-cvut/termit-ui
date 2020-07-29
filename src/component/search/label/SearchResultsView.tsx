import * as React from "react";
import {RouteComponentProps, withRouter} from "react-router";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {connect} from "react-redux";
import * as SearchActions from "../../../action/SearchActions";
import {ThunkDispatch} from "../../../util/Types";
import TermItState from "../../../model/TermItState";
import SearchResult from "../../../model/SearchResult";
import SearchResults from "./SearchResults";

interface SearchResultVocabulariesProps extends HasI18n, RouteComponentProps<any> {
    addSearchListener: () => void;
    removeSearchListener: () => void;
    searchResults: SearchResult[] | null;
}

export class SearchResultsView extends React.Component<SearchResultVocabulariesProps> {

    public componentDidMount() {
        this.props.addSearchListener();
    }

    public componentWillUnmount() {
        this.props.removeSearchListener();
    }

    public render() {
        if (this.props.searchResults) {
            return <SearchResults results={this.props.searchResults} />;
        } else {
            return null;
        }
    }

}

export default connect((state: TermItState) => {
    return {
        searchResults: state.searchResults,
    };
}, (dispatch: ThunkDispatch) => {
    return {
        addSearchListener: () => dispatch(SearchActions.addSearchListener()),
        removeSearchListener: () => dispatch(SearchActions.removeSearchListener()),
    };
})(withRouter(injectIntl(withI18n(SearchResultsView))));
