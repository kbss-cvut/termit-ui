import * as React from "react";
import { useState } from "react";
import Vocabulary from "../../model/Vocabulary";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import TermChangeFrequencyUI from "./TermChangeFrequencyUI";
import VocabularyUtils from "../../util/VocabularyUtils";
import Constants from "../../util/Constants";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import { useI18n } from "../hook/useI18n";
import AggregatedChangeInfo from "../../model/changetracking/AggregatedChangeInfo";
import {
  loadVocabularyContentChanges,
  loadVocabularyContentDetailedChanges,
} from "../../action/AsyncVocabularyActions";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import { VocabularyContentChangeFilterData } from "../../model/filter/VocabularyContentChangeFilterData";

interface TermChangeFrequencyProps {
  vocabulary: Vocabulary;
}

const TermChangeFrequency: React.FC<TermChangeFrequencyProps> = (props) => {
  const [aggregatedRecords, setAggregatedRecords] = React.useState<
    null | AggregatedChangeInfo[]
  >(null);
  const [changeRecords, setChangeRecords] = React.useState<
    null | ChangeRecord[]
  >(null);
  const { vocabulary } = props;
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [page, setPage] = React.useState(0);
  const [filterData, setFilterData] =
    useState<VocabularyContentChangeFilterData>({
      term: "",
      changeType: "",
      attribute: "",
      author: "",
    });
  React.useEffect(() => {
    if (vocabulary.iri !== Constants.EMPTY_ASSET_IRI) {
      trackPromise(
        dispatch(
          loadVocabularyContentChanges(VocabularyUtils.create(vocabulary.iri))
        ).then((recs) => setAggregatedRecords(recs)),
        "term-change-frequency"
      );
    }
  }, [vocabulary.iri, dispatch]);

  React.useEffect(() => {
    if (vocabulary.iri !== Constants.EMPTY_ASSET_IRI) {
      trackPromise(
        dispatch(
          loadVocabularyContentDetailedChanges(
            VocabularyUtils.create(vocabulary.iri),
            filterData,
            { page: page, size: Constants.VOCABULARY_CONTENT_HISTORY_LIMIT }
          )
        ).then((changeRecords) => setChangeRecords(changeRecords)),
        "term-change-frequency"
      );
    }
  }, [vocabulary.iri, dispatch, page, filterData]);

  return (
    <>
      <PromiseTrackingMask
        area="term-change-frequency"
        text={i18n("vocabulary.termchanges.loading")}
      />
      <TermChangeFrequencyUI
        aggregatedRecords={aggregatedRecords}
        changeRecords={changeRecords}
        page={page}
        setPage={setPage}
        pageSize={Constants.VOCABULARY_CONTENT_HISTORY_LIMIT}
        applyFilter={setFilterData}
      />
    </>
  );
};

export default TermChangeFrequency;
