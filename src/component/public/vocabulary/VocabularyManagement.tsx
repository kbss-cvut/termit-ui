import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import VocabularyList from "../../vocabulary/VocabularyList";
import {injectIntl} from "react-intl";
import {useDispatch} from "react-redux";
import {loadPublicVocabularies} from "../../../action/AsyncPublicViewActions";
import HeaderWithActions from "../../misc/HeaderWithActions";
import WindowTitle from "../../misc/WindowTitle";

interface VocabulariesProps extends HasI18n {
    loadVocabularies: () => void;
}

const VocabularyManagement: React.FC<VocabulariesProps> = props => {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(loadPublicVocabularies());
    }, [dispatch]);

    return <div id="public-vocabularies">
        <WindowTitle title={props.i18n("vocabulary.management.vocabularies")}/>
        <HeaderWithActions title={props.i18n("vocabulary.management.vocabularies")}/>
        <VocabularyList/>
    </div>;
};

export default injectIntl(withI18n(VocabularyManagement));
