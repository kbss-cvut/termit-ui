import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { GoClippy } from "react-icons/go";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { executeFileTextAnalysis } from "../../action/AsyncActions";
import ResourceSelectVocabulary from "../resource/ResourceSelectVocabulary";
import Vocabulary from "../../model/Vocabulary";
import { IRI, IRIImpl } from "../../util/VocabularyUtils";
import { IMessage, withSubscription } from "react-stomp-hooks";
import Constants from "../../util/Constants";
import { publishMessage, publishNotification } from "../../action/SyncActions";
import NotificationType from "../../model/NotificationType";
import Message from "../../model/Message";
import MessageType from "../../model/MessageType";

interface TextAnalysisInvocationButtonProps extends HasI18n {
  id?: string;
  fileIri: IRI;
  defaultVocabularyIri?: string;
  executeTextAnalysis: (fileIri: IRI, vocabularyIri: string) => Promise<any>;
  notifyAnalysisFinish: () => void;
  className?: string;
}

interface TextAnalysisInvocationButtonState {
  showVocabularySelector: boolean;
}

export class TextAnalysisInvocationButton extends React.Component<
  TextAnalysisInvocationButtonProps,
  TextAnalysisInvocationButtonState
> {
  constructor(props: TextAnalysisInvocationButtonProps) {
    super(props);
    this.state = { showVocabularySelector: false };
  }

  public onClick = () => {
    this.setState({ showVocabularySelector: true });
  };

  private invokeTextAnalysis(fileIri: IRI, vocabularyIri: string) {
    this.props.executeTextAnalysis(fileIri, vocabularyIri);
  }

  public onVocabularySelect = (vocabulary: Vocabulary | null) => {
    this.closeVocabularySelect();
    if (!vocabulary) {
      return;
    }
    this.invokeTextAnalysis(this.props.fileIri, vocabulary.iri);
  };

  private closeVocabularySelect = () => {
    this.setState({ showVocabularySelector: false });
  };

  public onMessage(message: IMessage) {
    if (!message?.body) {
      return;
    }
    if (
      message.body.substring(1, message.body.length - 1) ===
      IRIImpl.toString(this.props.fileIri)
    ) {
      this.props.notifyAnalysisFinish();
    }
  }

  public render() {
    const i18n = this.props.i18n;
    return (
      <>
        <ResourceSelectVocabulary
          show={this.state.showVocabularySelector}
          defaultVocabularyIri={this.props.defaultVocabularyIri}
          onCancel={this.closeVocabularySelect}
          onSubmit={this.onVocabularySelect}
          title={i18n("file.metadata.startTextAnalysis.vocabularySelect.title")}
        />
        <Button
          id={this.props.id}
          size="sm"
          color="primary"
          className={this.props.className}
          title={i18n("file.metadata.startTextAnalysis")}
          onClick={this.onClick}
        >
          <GoClippy className="mr-1" />
          {i18n("file.metadata.startTextAnalysis.text")}
        </Button>
      </>
    );
  }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    executeTextAnalysis: (fileIri: IRI, vocabularyIri: string) =>
      dispatch(executeFileTextAnalysis(fileIri, vocabularyIri)),
    notifyAnalysisFinish: () => {
      dispatch(
        publishMessage(
          new Message(
            {
              messageId: "file.text-analysis.finished.message",
            },
            MessageType.SUCCESS
          )
        )
      );
      dispatch(
        publishNotification({
          source: { type: NotificationType.TEXT_ANALYSIS_FINISHED },
        })
      );
    },
  };
})(
  injectIntl(
    withI18n(
      withSubscription(
        TextAnalysisInvocationButton,
        Constants.WEBSOCKET_ENDPOINT.VOCABULARIES_TEXT_ANALYSIS_FINISHED_FILE
      )
    )
  )
);
