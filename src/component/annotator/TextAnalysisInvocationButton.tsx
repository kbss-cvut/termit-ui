import { useCallback, useState } from "react";
import { GoClippy } from "react-icons/go";
import { Button } from "reactstrap";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import ResourceSelectVocabulary from "../resource/ResourceSelectVocabulary";
import Vocabulary from "../../model/Vocabulary";
import { IRI, IRIImpl } from "../../util/VocabularyUtils";
import { IMessage, useSubscription } from "react-stomp-hooks";
import Constants from "../../util/Constants";
import { useI18n } from "../hook/useI18n";
import { executeFileTextAnalysis } from "../../action/AsyncActions";
import { publishMessage, publishNotification } from "../../action/SyncActions";
import Message, { createFormattedMessage } from "../../model/Message";
import MessageType from "../../model/MessageType";
import NotificationType from "../../model/NotificationType";

interface TextAnalysisInvocationButtonProps {
  id?: string;
  fileIri: IRI;
  defaultVocabularyIri?: string;
  className?: string;
}

function stripQuotes(str: string): string {
  return str.replace(/^"(.*)"$/, "$1");
}

export default function TextAnalysisInvocationButton(
  props: TextAnalysisInvocationButtonProps
) {
  const { id, fileIri, defaultVocabularyIri, className } = props;
  const [showVocabularySelector, setShowVocabularySelector] = useState(false);
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();

  const openVocabularySelector = useCallback(
    () => setShowVocabularySelector(true),
    [setShowVocabularySelector]
  );

  const closeVocabularySelector = useCallback(
    () => setShowVocabularySelector(false),
    [setShowVocabularySelector]
  );

  const executeTextAnalysis = useCallback(
    (fileIri: IRI, vocabularyIri: string) =>
      dispatch(executeFileTextAnalysis(fileIri, vocabularyIri)),
    [dispatch]
  );

  const notifyAnalysisFinish = useCallback(() => {
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
  }, [dispatch]);

  const notifyAnalysisFailed = useCallback(
    (message: string) =>
      dispatch(
        publishMessage(
          createFormattedMessage(
            "file.text-analysis.failed",
            { message },
            MessageType.ERROR
          )
        )
      ),
    [dispatch]
  );

  const onVocabularySelect = useCallback(
    (vocabulary: Vocabulary | null) => {
      setShowVocabularySelector(false);
      if (!vocabulary) {
        return;
      }
      executeTextAnalysis(fileIri, vocabulary.iri);
    },
    [setShowVocabularySelector, executeTextAnalysis, fileIri]
  );

  const onWsMessage = useCallback(
    (message: IMessage) => {
      if (
        message.headers.destination ===
          Constants.WEBSOCKET_ENDPOINT
            .VOCABULARIES_TEXT_ANALYSIS_FINISHED_FILE &&
        stripQuotes(message.body) === IRIImpl.toString(fileIri)
      ) {
        notifyAnalysisFinish();
      }
      if (
        message.headers.destination ===
        Constants.WEBSOCKET_ENDPOINT.VOCABULARIES_TEXT_ANALYSIS_FAILED
      ) {
        notifyAnalysisFailed(stripQuotes(message.body));
      }
    },
    [fileIri, notifyAnalysisFinish, notifyAnalysisFailed]
  );

  useSubscription(
    [
      Constants.WEBSOCKET_ENDPOINT.VOCABULARIES_TEXT_ANALYSIS_FINISHED_FILE,
      Constants.WEBSOCKET_ENDPOINT.VOCABULARIES_TEXT_ANALYSIS_FAILED,
    ],
    onWsMessage
  );

  return (
    <>
      <ResourceSelectVocabulary
        show={showVocabularySelector}
        defaultVocabularyIri={defaultVocabularyIri}
        onCancel={closeVocabularySelector}
        onSubmit={onVocabularySelect}
        title={i18n("file.metadata.startTextAnalysis.vocabularySelect.title")}
      />
      <Button
        id={id}
        size="sm"
        color="primary"
        className={className}
        title={i18n("file.metadata.startTextAnalysis")}
        onClick={openVocabularySelector}
      >
        <GoClippy className="mr-1" />
        {i18n("file.metadata.startTextAnalysis.text")}
      </Button>
    </>
  );
}
