import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import {
  loadFileContent,
  loadVocabulary,
  saveFileContent,
} from "../../action/AsyncActions";
import { IRI } from "../../util/VocabularyUtils";
import { ThunkDispatch } from "../../util/Types";
import Annotator from "../annotator/Annotator";
import {
  clearFileContent,
  consumeNotification,
} from "../../action/SyncActions";
import { TextQuoteSelector } from "../../model/TermOccurrence";
import Mask from "../misc/Mask";
import AppNotification from "../../model/AppNotification";
import NotificationType from "../../model/NotificationType";
import { loadAllTerms } from "../../action/AsyncAnnotatorActions";

interface FileDetailProvidedProps {
  iri: IRI;
  vocabularyIri: IRI;
  scrollTo?: TextQuoteSelector; // Selector of an annotation to scroll to (and highlight) after rendering
}

interface FileDetailOwnProps extends HasI18n {
  fileContent: string | null;
  consumeNotification: (notification: AppNotification) => void;
  notifications: AppNotification[];
  loadFileContent: (fileIri: IRI) => void;
  saveFileContent: (fileIri: IRI, fileContent: string) => void;
  clearFileContent: () => void;
  loadVocabulary: (vocabularyIri: IRI) => void;
  fetchTerms: (vocabularyIri: IRI) => Promise<any>;
}

type FileDetailProps = FileDetailOwnProps & FileDetailProvidedProps;

interface FileDetailState {
  fileContentId: number;
  termsLoading: boolean;
}

export class FileContentDetail extends React.Component<
  FileDetailProps,
  FileDetailState
> {
  constructor(props: FileDetailProps) {
    super(props);
    this.state = {
      fileContentId: 1,
      termsLoading: false,
    };
  }

  private loadFileContentData = (): void => {
    this.props.loadFileContent({
      fragment: this.props.iri.fragment,
      namespace: this.props.iri.namespace,
    });
  };

  private initializeTermFetching = (): void => {
    this.setState({ termsLoading: true });
    this.props
      .fetchTerms(this.props.vocabularyIri)
      .then(() => this.setState({ termsLoading: false }));
  };

  public componentDidMount(): void {
    this.loadFileContentData();
    this.initializeTermFetching();
    this.props.loadVocabulary(this.props.vocabularyIri);
  }

  public componentDidUpdate(prevProps: FileDetailProps): void {
    if (
      isDifferent(this.props.iri, prevProps.iri) ||
      isDifferent(this.props.vocabularyIri, prevProps.vocabularyIri)
    ) {
      this.loadFileContentData();
      this.initializeTermFetching();
      this.props.loadVocabulary(this.props.vocabularyIri);
    }

    const analysisFinishedNotification = this.props.notifications.find(
      (n) => n.source.type === NotificationType.TEXT_ANALYSIS_FINISHED
    );
    if (analysisFinishedNotification) {
      this.props.consumeNotification(analysisFinishedNotification);
      this.loadFileContentData();
      this.initializeTermFetching();
    }

    if (prevProps.fileContent !== this.props.fileContent) {
      this.setState({ fileContentId: this.state.fileContentId + 1 });
    }
  }

  public componentWillUnmount(): void {
    this.props.clearFileContent();
  }

  private onUpdate = (newFileContent: string) => {
    this.props.saveFileContent(
      {
        fragment: this.props.iri.fragment,
        namespace: this.props.iri.namespace,
      },
      newFileContent
    );
  };

  public render() {
    if (!this.props.fileContent || this.state.termsLoading) {
      return <Mask text={this.props.i18n("annotator.content.loading")} />;
    }
    return (
      <Annotator
        key={this.state.fileContentId}
        fileIri={this.props.iri}
        vocabularyIri={this.props.vocabularyIri}
        initialHtml={this.props.fileContent}
        scrollTo={this.props.scrollTo}
        onUpdate={this.onUpdate}
      />
    );
  }
}

function isDifferent(iri1?: IRI, iri2?: IRI): boolean {
  const iri1Str = iri1 ? iri1!.namespace + iri1!.fragment : null;
  const iri2Str = iri2 ? iri2!.namespace + iri2!.fragment : null;

  return iri1Str !== iri2Str;
}

export default connect(
  (state: TermItState) => {
    return {
      fileContent: state.fileContent,
      notifications: state.notifications,
      intl: state.intl,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      loadFileContent: (fileIri: IRI) => dispatch(loadFileContent(fileIri)),
      saveFileContent: (fileIri: IRI, fileContent: string) =>
        dispatch(saveFileContent(fileIri, fileContent)),
      clearFileContent: () => dispatch(clearFileContent()),
      loadVocabulary: (vocabularyIri: IRI) =>
        dispatch(loadVocabulary(vocabularyIri, false)),
      fetchTerms: (vocabularyIri: IRI) =>
        dispatch(loadAllTerms(vocabularyIri, true)),
      consumeNotification: (notification: AppNotification) =>
        dispatch(consumeNotification(notification)),
    };
  }
)(injectIntl(withI18n(FileContentDetail)));
