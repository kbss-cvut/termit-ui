import * as React from "react";
import "./Search.scss";
import SearchResults from "./SearchResults";
import WindowTitle from "../../misc/WindowTitle";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { ThunkDispatch } from "../../../util/Types";
import {
  addSearchListener,
  removeSearchListener,
} from "../../../action/SearchActions";
import { useI18n } from "../../hook/useI18n";
import SearchMask from "./SearchMask";

const Search: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(addSearchListener());
    return () => dispatch(removeSearchListener()) as any;
  }, [dispatch]);
  let results = useSelector((state: TermItState) => state.searchResults);

  return (
    <div className="relative">
      <WindowTitle title={i18n("search.title")} />
      <SearchResults results={results} withFacetedSearchLink={true} />
      <SearchMask />
    </div>
  );
};

export default Search;
