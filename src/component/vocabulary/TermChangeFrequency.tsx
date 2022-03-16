import * as React from "react";
import Vocabulary from "../../model/Vocabulary";
import { loadVocabularyContentChanges } from "../../action/AsyncActions";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import TermChangeFrequencyUI from "./TermChangeFrequencyUI";
import VocabularyUtils from "../../util/VocabularyUtils";
import Constants from "../../util/Constants";

interface TermChangeFrequencyProps {
  vocabulary: Vocabulary;
}

const TermChangeFrequency: React.FC<TermChangeFrequencyProps> = (props) => {
  const [records, setRecords] = React.useState<null | ChangeRecord[]>(null);
  const { vocabulary } = props;
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    if (vocabulary.iri !== Constants.EMPTY_ASSET_IRI) {
      dispatch(
        loadVocabularyContentChanges(VocabularyUtils.create(vocabulary.iri))
      ).then((recs) => setRecords(recs));
    }
  }, [vocabulary, dispatch]);

  return (
    <>
      <TermChangeFrequencyUI records={records} />
    </>
  );
};

export default TermChangeFrequency;
