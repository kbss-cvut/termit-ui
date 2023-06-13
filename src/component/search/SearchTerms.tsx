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
import SearchResults from "./label/SearchResults";
import TermResultVocabularyFilter from "./label/TermResultVocabularyFilter";
import { useI18n } from "../hook/useI18n";
import Utils from "../../util/Utils";
import { Card, CardBody } from "reactstrap";
import SearchMask from "./label/SearchMask";

const SearchTerms: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(addSearchListener());
    return () => dispatch(removeSearchListener()) as any;
  }, [dispatch]);
  const [vocabularies, setVocabularies] = React.useState<string[]>([]);
  let allResults = useSelector((state: TermItState) => state.searchResults);
  let resultsToRender = null;
  if (allResults !== null) {
    resultsToRender = allResults.filter(
      (r) =>
        r.hasType(VocabularyUtils.TERM) &&
        r.vocabulary !== undefined &&
        (vocabularies.length === 0 ||
          vocabularies.indexOf(r.vocabulary.iri) !== -1)
    );
  }

  return (
    <div className="relative">
      <WindowTitle title={i18n("search.title")} />
      <Card className="mb-0">
        <CardBody>
          <TermResultVocabularyFilter
            searchResults={Utils.sanitizeArray(allResults)}
            selectedVocabularies={vocabularies}
            onChange={setVocabularies}
          />
        </CardBody>
      </Card>
      <SearchResults results={resultsToRender} />
      <SearchMask />
    </div>
  );
};

export default SearchTerms;
