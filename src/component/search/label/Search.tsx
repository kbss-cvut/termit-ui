import * as React from "react";
import { HasI18n } from "../../hoc/withI18n";
import SearchResult from "../../../model/SearchResult";
import "./Search.scss";
import SearchQuery from "../../../model/SearchQuery";
import SearchResults from "./SearchResults";
import ContainerMask from "../../misc/ContainerMask";
import WindowTitle from "../../misc/WindowTitle";

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
        {results ? <SearchResults results={results} /> : null}
        {loading}
      </div>
    );
  }
}

export default Search;
