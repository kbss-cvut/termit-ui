import * as React from "react";
import {IRI} from "../../util/VocabularyUtils";
import TextAnalysisInvocationButton from "../resource/file/TextAnalysisInvocationButton";

interface ShowTextAnalysisInvocationButtonProps {
    fileIri: IRI;
    vocabularyIri: IRI;
}

const ShowTextAnalysisInvocationButton: React.FC<ShowTextAnalysisInvocationButtonProps> = props =>
    <TextAnalysisInvocationButton
        className="analyze-button"
        fileIri={props.fileIri}
        defaultVocabularyIri={props.vocabularyIri.toString()}/>;

export default ShowTextAnalysisInvocationButton;
