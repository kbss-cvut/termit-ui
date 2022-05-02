import * as React from "react";
import withI18n, { HasI18n } from "../../hoc/withI18n";
import SearchResult from "../../../model/SearchResult";
import "./Search.scss";
import SearchQuery from "../../../model/SearchQuery";
import SearchResults from "./SearchResults";
import ContainerMask from "../../misc/ContainerMask";
import WindowTitle from "../../misc/WindowTitle";
import { connect } from "react-redux";
import TermItState from "../../../model/TermItState";
import { ThunkDispatch } from "../../../util/Types";
import * as SearchActions from "../../../action/SearchActions";
import { injectIntl } from "react-intl";
import { Card, CardBody } from "reactstrap";

interface DispatchProps {
  addSearchListener: () => void;
  removeSearchListener: () => void;
  updateSearchFilter: (searchString: string) => any;
}

interface StateProps {
  searchQuery: SearchQuery;
  searchResults: SearchResult[] | null;
  searchInProgress: boolean;
}

export interface SearchProps extends DispatchProps, StateProps, HasI18n {}

export class Search<
  P extends SearchProps = SearchProps,
  S extends {} = {}
> extends React.Component<P, S> {
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
        {results && (
          <Card className="mb-3">
            <CardBody>
              <SearchResults results={results} />
            </CardBody>
          </Card>
        )}
        {loading}
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, {}, TermItState>(
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
)(injectIntl(withI18n(Search as any)));
