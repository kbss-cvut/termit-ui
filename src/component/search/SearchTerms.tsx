import * as SearchActions from "../../action/SearchActions";
import {injectIntl} from "react-intl";
import withI18n from "../hoc/withI18n";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import TermItState from "../../model/TermItState";
import {Search} from "./label/Search";
import SearchResult from "../../model/SearchResult";
import VocabularyUtils from "../../util/VocabularyUtils";

export class SearchTerms extends Search {

    protected getResults(): SearchResult[] | null {
        return this.props.searchResults ? this.props.searchResults.filter(r => r.hasType(VocabularyUtils.TERM)) : null;
    }
}

export default connect((state: TermItState) => {
    return {
        searchQuery: state.searchQuery,
        searchResults: state.searchResults,
        searchInProgress: state.searchInProgress,
    };
}, (dispatch: ThunkDispatch) => {
    return {
        updateSearchFilter: (searchString: string) => dispatch(SearchActions.updateSearchFilter(searchString)),
        addSearchListener: () => dispatch(SearchActions.addSearchListener()),
        removeSearchListener: () => dispatch(SearchActions.removeSearchListener()),
    };
})(injectIntl(withI18n(SearchTerms)));
