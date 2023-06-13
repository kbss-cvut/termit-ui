import React from "react";
import {
  addSearchListener,
  removeSearchListener,
} from "../../action/SearchActions";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import TermItState from "../../model/TermItState";
import VocabularyUtils from "../../util/VocabularyUtils";
import WindowTitle from "../misc/WindowTitle";
import { useI18n } from "../hook/useI18n";
import SearchResults from "./label/SearchResults";
import ContainerMask from "../misc/ContainerMask";

const SearchVocabularies: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(addSearchListener());
    return () => dispatch(removeSearchListener()) as any;
  }, [dispatch]);
  let results = useSelector((state: TermItState) => state.searchResults);
  let loading = useSelector((state: TermItState) => state.searchInProgress);
  if (results !== null) {
    results = results.filter((r) => r.hasType(VocabularyUtils.VOCABULARY));
  }

  return (
    <div className="relative">
      <WindowTitle title={i18n("search.title")} />
      <SearchResults results={results} />
      {loading && <ContainerMask />}
    </div>
  );
};

export default SearchVocabularies;
