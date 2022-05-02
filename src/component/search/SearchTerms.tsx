import * as SearchActions from "../../action/SearchActions";
import { injectIntl } from "react-intl";
import withI18n from "../hoc/withI18n";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import TermItState from "../../model/TermItState";
import { Search, SearchProps } from "./label/Search";
import SearchResult from "../../model/SearchResult";
import VocabularyUtils from "../../util/VocabularyUtils";
import ContainerMask from "../misc/ContainerMask";
import WindowTitle from "../misc/WindowTitle";
import SearchResults from "./label/SearchResults";
import TermResultVocabularyFilter from "./label/TermResultVocabularyFilter";
import { Card, CardBody } from "reactstrap";

interface SearchTermsState {
  vocabularies: string[];
}

export class SearchTerms extends Search<SearchProps, SearchTermsState> {
  constructor(props: SearchProps) {
    super(props);
    this.state = {
      vocabularies: [],
    };
  }

  protected getResults(): SearchResult[] | null {
    return this.props.searchResults
      ? this.props.searchResults.filter(
          (r) => r.hasType(VocabularyUtils.TERM) && this.doesVocabularyMatch(r)
        )
      : null;
  }

  private doesVocabularyMatch(r: SearchResult) {
    return (
      r.vocabulary !== undefined &&
      (this.state.vocabularies.length === 0 ||
        this.state.vocabularies.indexOf(r.vocabulary.iri) !== -1)
    );
  }

  public onFilteringVocabulariesSelect = (vocabularyIris: string[]) => {
    this.setState({ vocabularies: vocabularyIris });
  };

  public render() {
    const loading = this.props.searchInProgress ? <ContainerMask /> : null;
    const results = this.getResults();

    return (
      <div className="relative">
        <WindowTitle title={this.props.i18n("search.title")} />
        {results && (
          <Card className="mb-3">
            <CardBody>
              <TermResultVocabularyFilter
                searchResults={this.props.searchResults!}
                selectedVocabularies={this.state.vocabularies}
                onChange={this.onFilteringVocabulariesSelect}
              />
              <SearchResults results={results} />
            </CardBody>
          </Card>
        )}
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
      searchInProgress: state.searchInProgress,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      updateSearchFilter: (searchString: string) =>
        dispatch(SearchActions.updateSearchFilter(searchString)),
      addSearchListener: () => dispatch(SearchActions.addSearchListener()),
      removeSearchListener: () =>
        dispatch(SearchActions.removeSearchListener()),
    };
  }
)(injectIntl(withI18n(SearchTerms)));
