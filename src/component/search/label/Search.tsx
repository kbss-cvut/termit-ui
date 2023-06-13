import * as React from "react";
import "./Search.scss";
import SearchResults from "./SearchResults";
import ContainerMask from "../../misc/ContainerMask";
import WindowTitle from "../../misc/WindowTitle";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { ThunkDispatch } from "../../../util/Types";
import {
  addSearchListener,
  removeSearchListener,
} from "../../../action/SearchActions";
import { useI18n } from "../../hook/useI18n";

const Search: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(addSearchListener());
    return () => dispatch(removeSearchListener()) as any;
  }, [dispatch]);
  let results = useSelector((state: TermItState) => state.searchResults);
  let loading = useSelector((state: TermItState) => state.searchInProgress);

  return (
    <div className="relative">
      <WindowTitle title={i18n("search.title")} />
      <SearchResults results={results} />
      {loading && <ContainerMask />}
    </div>
  );
};

export default Search;
