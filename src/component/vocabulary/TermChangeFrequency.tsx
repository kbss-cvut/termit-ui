import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Vocabulary from "../../model/Vocabulary";
import {injectIntl} from "react-intl";
import {loadVocabularyContentChanges} from "../../action/AsyncActions";
import {ThunkDispatch} from "../../util/Types";
import {connect} from "react-redux";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import TermChangeFrequencyUI from "./TermChangeFrequencyUI";
import VocabularyUtils from "../../util/VocabularyUtils";
import Constants from "../../util/Constants";

interface TermChangeFrequencyProps extends HasI18n {
    vocabulary: Vocabulary;
    loadContentChanges: (vocabulary: Vocabulary) => Promise<any>;
}

export const TermChangeFrequency: React.FC<TermChangeFrequencyProps> = props => {
    const [records, setRecords] = React.useState<null | ChangeRecord[]>(null);
    React.useEffect(() => {
        if (props.vocabulary.iri !== Constants.EMPTY_ASSET_IRI) {
            props.loadContentChanges(props.vocabulary).then(recs => setRecords(recs));
        }
    }, [props.vocabulary]);

    return <>
        <TermChangeFrequencyUI records={(records || [])}/>
    </>;
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        loadContentChanges: (vocabulary: Vocabulary) => dispatch(loadVocabularyContentChanges(VocabularyUtils.create(vocabulary.iri))),
    };
})(injectIntl(withI18n(TermChangeFrequency)));
