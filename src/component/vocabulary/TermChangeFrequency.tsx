import * as React from "react";
import Vocabulary from "../../model/Vocabulary";
import { loadVocabularyContentChanges } from "../../action/AsyncActions";
import { ThunkDispatch } from "../../util/Types";
import { connect } from "react-redux";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import TermChangeFrequencyUI from "./TermChangeFrequencyUI";
import VocabularyUtils from "../../util/VocabularyUtils";
import Constants from "../../util/Constants";

interface TermChangeFrequencyProps {
  vocabulary: Vocabulary;
  loadContentChanges: (vocabulary: Vocabulary) => Promise<any>;
}

export const TermChangeFrequency: React.FC<TermChangeFrequencyProps> = (
  props
) => {
  const [records, setRecords] = React.useState<null | ChangeRecord[]>(null);
  const { vocabulary, loadContentChanges } = props;
  React.useEffect(() => {
    if (vocabulary.iri !== Constants.EMPTY_ASSET_IRI) {
      loadContentChanges(vocabulary).then((recs) => setRecords(recs));
    }
  }, [vocabulary, loadContentChanges]);

  return (
    <>
      <TermChangeFrequencyUI records={records || []} />
    </>
  );
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    loadContentChanges: (vocabulary: Vocabulary) =>
      dispatch(
        loadVocabularyContentChanges(VocabularyUtils.create(vocabulary.iri))
      ),
  };
})(TermChangeFrequency);
