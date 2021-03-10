import * as React from "react";
import VocabularyList from "../../vocabulary/VocabularyList";
import {useDispatch} from "react-redux";
import {loadPublicVocabularies} from "../../../action/AsyncPublicViewActions";
import HeaderWithActions from "../../misc/HeaderWithActions";
import WindowTitle from "../../misc/WindowTitle";
import {useI18n} from "../../hook/useI18n";

interface VocabulariesProps {
    loadVocabularies: () => void;
}

const VocabularyManagement: React.FC<VocabulariesProps> = () => {
    const {i18n} = useI18n();
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(loadPublicVocabularies());
    }, [dispatch]);

    return <div id="public-vocabularies">
        <WindowTitle title={i18n("vocabulary.management.vocabularies")}/>
        <HeaderWithActions title={i18n("vocabulary.management.vocabularies")}/>
        <VocabularyList/>
    </div>;
};

export default VocabularyManagement;
