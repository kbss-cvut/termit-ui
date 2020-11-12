import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import withInjectableLoading, {InjectsLoading} from "../../hoc/withInjectableLoading";
import {GoClippy} from "react-icons/go";
import {Button} from "reactstrap";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {executeFileTextAnalysis} from "../../../action/AsyncActions";
import {publishNotification} from "../../../action/SyncActions";
import NotificationType from "../../../model/NotificationType";
import ResourceSelectVocabulary from "../ResourceSelectVocabulary";
import Vocabulary from "../../../model/Vocabulary";
import {IRI} from "../../../util/VocabularyUtils";

interface TextAnalysisInvocationButtonProps extends HasI18n, InjectsLoading {
    id?: string;
    fileIri: IRI;
    defaultVocabularyIri?: string;
    executeTextAnalysis: (fileIri: IRI, vocabularyIri: string) => Promise<any>;
    notifyAnalysisFinish: () => void;
    className?: string
}

interface TextAnalysisInvocationButtonState {
    showVocabularySelector: boolean;

}

export class TextAnalysisInvocationButton extends React.Component<TextAnalysisInvocationButtonProps, TextAnalysisInvocationButtonState> {

    constructor(props: InjectsLoading & TextAnalysisInvocationButtonProps) {
        super(props);
        this.state = {showVocabularySelector: false};
    }

    public onClick = () => {
        if (this.props.defaultVocabularyIri) {
            this.invokeTextAnalysis(this.props.fileIri,this.props.defaultVocabularyIri);
        } else {
            this.setState({showVocabularySelector: true});
        }
    };

    private invokeTextAnalysis(fileIri: IRI, vocabularyIri: string) {
        this.props.loadingOn();
        this.props.executeTextAnalysis(fileIri, vocabularyIri).then(() => {
            this.props.loadingOff();
            this.props.notifyAnalysisFinish();
        });
    }

    public onVocabularySelect = (vocabulary: Vocabulary | null) => {
        this.closeVocabularySelect();
        if (!vocabulary) {
            return;
        }
        this.invokeTextAnalysis(this.props.fileIri, vocabulary.iri);
    };

    private closeVocabularySelect = () => {
        this.setState({showVocabularySelector: false});
    };

    public render() {
        const i18n = this.props.i18n;
        return <>
            <ResourceSelectVocabulary show={this.state.showVocabularySelector}
                                      defaultVocabularyIri={this.props.defaultVocabularyIri}
                                      onCancel={this.closeVocabularySelect} onSubmit={this.onVocabularySelect}/>
            <Button id={this.props.id}
                    size="sm"
                    color="primary"
                    className={this.props.className}
                    title={i18n("file.metadata.startTextAnalysis")}
                    onClick={this.onClick}><GoClippy/>&nbsp;{i18n("file.metadata.startTextAnalysis.text")}
            </Button>
        </>;
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        executeTextAnalysis: (fileIri: IRI, vocabularyIri: string) => dispatch(executeFileTextAnalysis(fileIri, vocabularyIri)),
        notifyAnalysisFinish: () => dispatch(publishNotification({source: {type: NotificationType.TEXT_ANALYSIS_FINISHED}}))
    };
})(injectIntl(withI18n(withInjectableLoading(TextAnalysisInvocationButton))));
