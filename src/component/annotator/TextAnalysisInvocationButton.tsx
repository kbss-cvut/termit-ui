import * as React from "react";
import {GoClippy} from "react-icons/go";
import {Button} from "reactstrap";
import {useDispatch} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {executeFileTextAnalysis} from "../../action/AsyncActions";
import {publishNotification} from "../../action/SyncActions";
import NotificationType from "../../model/NotificationType";
import ResourceSelectVocabulary from "../resource/ResourceSelectVocabulary";
import Vocabulary from "../../model/Vocabulary";
import {IRI} from "../../util/VocabularyUtils";
import {useI18n} from "../hook/useI18n";

interface TextAnalysisInvocationButtonProps {
    fileIri: IRI;
    defaultVocabularyIri?: string;
    className?: string
}

const TextAnalysisInvocationButton: React.FC<TextAnalysisInvocationButtonProps> = props => {
    const {fileIri, defaultVocabularyIri, className} = props;
    const [showSelector, setShowSelector] = React.useState(false);
    const dispatch: ThunkDispatch = useDispatch();
    const {i18n} = useI18n();
    const close = () => setShowSelector(false);
    const submit = (voc: Vocabulary | null) => {
        close();
        if (!voc) {
            return;
        }
        dispatch(executeFileTextAnalysis(fileIri, voc.iri)).then(() => dispatch(publishNotification({source: {type: NotificationType.TEXT_ANALYSIS_FINISHED}})));
    };

    return <>
        <ResourceSelectVocabulary show={showSelector} defaultVocabularyIri={defaultVocabularyIri}
                                  onCancel={close} onSubmit={submit}/>
        <Button id="text-analysis-invocation-button"
                size="sm" color="primary"
                className={className}
                title={i18n("file.metadata.startTextAnalysis")}
                onClick={() => setShowSelector(true)}><GoClippy
            className="mr-1"/>{i18n("file.metadata.startTextAnalysis.text")}
        </Button>
    </>;
}

export default TextAnalysisInvocationButton;
