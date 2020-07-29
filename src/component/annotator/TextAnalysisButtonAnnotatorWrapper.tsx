import * as React from "react";
import {IRI} from "../../util/VocabularyUtils";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import TextAnalysisInvocationButton from "../resource/file/TextAnalysisInvocationButton";
import Vocabulary from "../../model/Vocabulary";

interface ShowTextAnalysisInvocationButtonProps {
    fileIri: IRI;
    vocabularyIri: IRI;
    vocabulary?: Vocabulary;
}

const ShowTextAnalysisInvocationButton: React.FC<ShowTextAnalysisInvocationButtonProps> = props => {
    const showTextAnalysisButton = props.vocabulary && props.vocabulary!.document && props.vocabulary!.document.files;
    return showTextAnalysisButton ?
        <TextAnalysisInvocationButton
            className="analyze-button"
            file={props.vocabulary!.document!.files.find(f => f.iri === props.fileIri.toString())!}
            vocabularyIri={props.vocabulary!.iri.toString()}/>
        : null;
}

export default connect((state: TermItState) => ({
    vocabulary: state.vocabulary
}))(ShowTextAnalysisInvocationButton);
