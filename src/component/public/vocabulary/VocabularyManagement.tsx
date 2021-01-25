import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import Vocabulary from "../../../model/Vocabulary";
import VocabularyList from "../../vocabulary/VocabularyList";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {loadPublicVocabularies} from "../../../action/AsyncPublicViewActions";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import HeaderWithActions from "../../misc/HeaderWithActions";
import WindowTitle from "../../misc/WindowTitle";

interface VocabulariesProps extends HasI18n {
    loadVocabularies: () => void;
}

const VocabularyManagement: React.FC<VocabulariesProps> = props => {
    const {loadVocabularies} = props;
    React.useEffect(() => {
        loadVocabularies();
    }, [loadVocabularies]);

    const onSelect = (voc: Vocabulary) => {
        if (voc === null) {
            Routing.transitionTo(Routes.publicVocabularies);
        } else {
            Routing.transitionToPublicAsset(voc);
        }
    };

    return <div id="public-vocabularies">
        <WindowTitle title={props.i18n("vocabulary.management.vocabularies")}/>
        <HeaderWithActions title={props.i18n("vocabulary.management.vocabularies")}/>
        <VocabularyList onSelect={onSelect}/>
    </div>;
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        loadVocabularies: () => dispatch(loadPublicVocabularies())
    }
})(injectIntl(withI18n(VocabularyManagement)));
