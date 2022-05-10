import * as React from "react";
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
import { loadVocabularyContentChanges } from "../../action/AsyncVocabularyActions";

interface TermChangeFrequencyProps {
  vocabulary: Vocabulary;
}

const TermChangeFrequency: React.FC<TermChangeFrequencyProps> = (props) => {
  const [records, setRecords] =
    React.useState<null | AggregatedChangeInfo[]>(null);
  const { vocabulary } = props;
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    if (vocabulary.iri !== Constants.EMPTY_ASSET_IRI) {
      trackPromise(
        dispatch(
          loadVocabularyContentChanges(VocabularyUtils.create(vocabulary.iri))
        ),
        "term-change-frequency"
      ).then((recs) => setRecords(recs));
    }
  }, [vocabulary.iri, dispatch]);

  return (
    <>
      <PromiseTrackingMask
        area="term-change-frequency"
        text={i18n("vocabulary.termchanges.loading")}
      />
      <TermChangeFrequencyUI records={records} />
    </>
  );
};

export default TermChangeFrequency;
