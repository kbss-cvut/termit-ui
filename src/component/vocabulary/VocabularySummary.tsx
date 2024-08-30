import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { RouteComponentProps } from "react-router";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import Vocabulary, { EMPTY_VOCABULARY } from "../../model/Vocabulary";
import {
  executeTextAnalysisOnAllTerms,
  loadResource,
  loadVocabulary,
  removeVocabulary,
  updateResource,
  updateVocabulary,
} from "../../action/AsyncActions";
import { Button } from "reactstrap";
import { GoPencil } from "react-icons/go";
import VocabularyUtils, { IRI, IRIImpl } from "../../util/VocabularyUtils";
import { ThunkDispatch } from "../../util/Types";
import EditableComponent, {
  EditableComponentState,
} from "../misc/EditableComponent";
import VocabularyEdit from "./VocabularyEdit";
import VocabularyMetadata from "./VocabularyMetadata";
import Utils from "../../util/Utils";
import HeaderWithActions from "../misc/HeaderWithActions";
import CopyIriIcon from "../misc/CopyIriIcon";
import { FaTrashAlt } from "react-icons/fa";
import WindowTitle from "../misc/WindowTitle";
import { importIntoExistingVocabulary } from "../../action/AsyncImportActions";
import "./VocabularySummary.scss";
import VocabularyActions from "./VocabularyActions";
import ExportVocabularyDialog from "./ExportVocabularyDialog";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { createVocabularySnapshot } from "../../action/AsyncVocabularyActions";
import { trackPromise } from "react-promise-tracker";
import VocabularyReadOnlyIcon from "./authorization/VocabularyReadOnlyIcon";
import { Configuration } from "../../model/Configuration";
import VocabularySnapshotIcon from "./snapshot/VocabularySnapshotIcon";
import CreateSnapshotDialog from "./CreateSnapshotDialog";
import classNames from "classnames";
import SnapshotCreationInfo from "../snapshot/SnapshotCreationInfo";
import Resource from "../../model/Resource";
import Document, { DocumentData } from "../../model/Document";
import NothingIfEmptyAsset from "../asset/NothingIfEmptyAsset";
import IfVocabularyActionAuthorized from "./authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";
import { getShortLocale } from "../../util/IntlUtil";
import { getLocalized } from "../../model/MultilingualString";
import RemoveVocabularyDialog from "./RemoveVocabularyDialog";
import {
  Client,
  IMessage,
  withStompClient,
  withSubscription,
} from "react-stomp-hooks";
import { HasStompClient } from "../hoc/withStompClient";
import Constants from "../../util/Constants";
import { vocabularyValidation } from "../../reducer/WebSocketVocabularyDispatchers";
import { requestVocabularyValidation } from "../../action/WebSocketVocabularyActions";

interface VocabularySummaryProps
  extends HasI18n,
    RouteComponentProps<any>,
    HasStompClient {
  vocabulary: Vocabulary;
  configuration: Configuration;
  loadResource: (iri: IRI) => void;
  loadVocabulary: (iri: IRI) => Promise<any>;
  requestVocabularyValidation: (
    vocabularyIri: IRI,
    stompClient: Client
  ) => void;
  vocabularyValidation: (
    message: IMessage,
    vocabularyIri: string
  ) => Promise<boolean>;
  updateVocabulary: (vocabulary: Vocabulary) => Promise<any>;
  removeVocabulary: (vocabulary: Vocabulary) => Promise<any>;
  importSkos: (iri: IRI, file: File) => Promise<any>;
  executeTextAnalysisOnAllTerms: (iri: IRI) => void;
  createSnapshot: (iri: IRI) => Promise<any>;
  updateDocument: (document: Document) => Promise<Resource | null>;
}

export interface VocabularySummaryState extends EditableComponentState {
  selectDocumentDialogOpen: boolean;
  showExportDialog: boolean;
  showSnapshotDialog: boolean;
  language: string;
}

export function resolveInitialLanguage(
  vocabulary: Vocabulary | null,
  locale: string,
  configuredLanguage: string
) {
  const supported = vocabulary ? Vocabulary.getLanguages(vocabulary) : [];
  const langLocale = getShortLocale(locale);
  return supported.indexOf(langLocale) !== -1 ? langLocale : configuredLanguage;
}

export class VocabularySummary extends EditableComponent<
  VocabularySummaryProps,
  VocabularySummaryState
> {
  constructor(props: VocabularySummaryProps) {
    super(props);
    this.state = {
      edit: false,
      showRemoveDialog: false,
      showExportDialog: false,
      showSnapshotDialog: false,
      selectDocumentDialogOpen: false,
      language: resolveInitialLanguage(
        props.vocabulary,
        props.locale,
        props.configuration.language
      ),
    };
  }

  public componentDidMount(): void {
    this.loadVocabulary();
  }

  public componentDidUpdate(prevProps: Readonly<VocabularySummaryProps>): void {
    const vocabulary = this.props.vocabulary;
    const stompWasLoaded =
      this.props.stompClient &&
      (prevProps.stompClient == null ||
        (!prevProps.stompClient.active && this.props.stompClient.active));
    if (vocabulary !== EMPTY_VOCABULARY || stompWasLoaded) {
      this.loadVocabulary();
    }
    if (prevProps.vocabulary.iri !== vocabulary.iri) {
      this.onCloseEdit();
      this.onCloseRemove();
      this.setState({
        language: resolveInitialLanguage(
          vocabulary,
          this.props.locale,
          this.props.configuration.language
        ),
      });
    }
  }

  private getIriFromUrl(): IRI {
    return Utils.resolveVocabularyIriFromRoute(
      this.props.match.params,
      this.props.location.search,
      this.props.configuration
    );
  }

  public onMessage(message: IMessage) {
    this.props.vocabularyValidation(
      message,
      IRIImpl.create(this.getIriFromUrl()).toString()
    );
  }

  public loadVocabulary = () => {
    const iriFromUrl = this.getIriFromUrl();
    const iri = VocabularyUtils.create(this.props.vocabulary.iri);
    if (
      iri.fragment !== iriFromUrl.fragment ||
      (iriFromUrl.namespace && iri.namespace !== iriFromUrl.namespace)
    ) {
      trackPromise(this.props.loadVocabulary(iriFromUrl), "vocabulary-summary");
    }
    this.props.requestVocabularyValidation(iriFromUrl, this.props.stompClient);
  };

  public setLanguage = (language: string) => {
    this.setState({ language });
  };

  public onSave = (vocabulary: Vocabulary) => {
    trackPromise(
      this.props.updateVocabulary(vocabulary),
      "vocabulary-summary"
    ).then(() => {
      this.onCloseEdit();
      const iri = VocabularyUtils.create(vocabulary.iri);
      this.props.loadVocabulary(iri);
    });
  };

  public onDocumentSave = (document: DocumentData) => {
    this.props.updateDocument(new Document(document));
  };

  public onRemove = () => {
    this.props.removeVocabulary(this.props.vocabulary).then(() => {
      this.onCloseRemove();
    });
  };

  public onExportToggle = () => {
    this.setState({ showExportDialog: !this.state.showExportDialog });
  };

  public onCreateSnapshot = () => {
    this.setState({ showSnapshotDialog: false });
    trackPromise(
      this.props.createSnapshot(
        VocabularyUtils.create(this.props.vocabulary.iri)
      ),
      "vocabulary-summary"
    );
  };

  public onCreateSnapshotToggle = () => {
    this.setState({ showSnapshotDialog: !this.state.showSnapshotDialog });
  };

  private onImport = (file: File) =>
    this.props.importSkos(
      VocabularyUtils.create(this.props.vocabulary.iri),
      file
    );

  public onFileAdded = () => {
    this.loadVocabulary();
  };

  private onExecuteTextAnalysisOnAllTerms = () => {
    this.props.executeTextAnalysisOnAllTerms(
      VocabularyUtils.create(this.props.vocabulary.iri)
    );
  };

  public render() {
    const { i18n, vocabulary } = this.props;
    const buttons = [];
    if (!this.state.edit) {
      buttons.push(
        <IfVocabularyActionAuthorized
          requiredAccessLevel={AccessLevel.WRITE}
          key="vocabulary-summary-edit"
          vocabulary={vocabulary}
        >
          <Button
            id="vocabulary-summary-edit"
            key="vocabulary.summary.edit"
            size="sm"
            color="primary"
            title={i18n("edit")}
            onClick={this.onEdit}
          >
            <GoPencil />
            &nbsp;{i18n("edit")}
          </Button>
        </IfVocabularyActionAuthorized>
      );
    }
    buttons.push(
      <IfVocabularyActionAuthorized
        requiredAccessLevel={AccessLevel.SECURITY}
        key="vocabulary-summary-remove"
        vocabulary={vocabulary}
      >
        <Button
          id="vocabulary-summary-remove"
          key="vocabulary.summary.remove"
          size="sm"
          color="outline-danger"
          title={i18n("asset.remove.tooltip")}
          onClick={this.onRemoveClick}
        >
          <FaTrashAlt />
          &nbsp;{i18n("remove")}
        </Button>
      </IfVocabularyActionAuthorized>
    );
    buttons.push(
      <VocabularyActions
        key="vocabulary-summary-actions"
        vocabulary={vocabulary}
        onAnalyze={this.onExecuteTextAnalysisOnAllTerms}
        onExport={this.onExportToggle}
        onImport={this.onImport}
        onCreateSnapshot={this.onCreateSnapshotToggle}
      />
    );

    return (
      <NothingIfEmptyAsset asset={vocabulary}>
        <div id="vocabulary-detail">
          <WindowTitle
            title={`${getLocalized(
              vocabulary.label,
              this.state.language
            )} | ${i18n("vocabulary.management.vocabularies")}`}
          />
          <HeaderWithActions title={this.renderTitle()} actions={buttons} />
          <RemoveVocabularyDialog
            show={this.state.showRemoveDialog}
            vocabulary={vocabulary}
            onSubmit={this.onRemove}
            onCancel={this.onCloseRemove}
          />
          <ExportVocabularyDialog
            show={this.state.showExportDialog}
            onClose={this.onExportToggle}
            vocabulary={vocabulary}
          />
          <CreateSnapshotDialog
            vocabulary={vocabulary}
            show={this.state.showSnapshotDialog}
            onClose={this.onCreateSnapshotToggle}
            onConfirm={this.onCreateSnapshot}
          />
          <PromiseTrackingMask area="vocabulary-summary" />
          {this.state.edit ? (
            <VocabularyEdit
              save={this.onSave}
              saveDocument={this.onDocumentSave}
              cancel={this.onCloseEdit}
              vocabulary={vocabulary}
              language={this.state.language}
              selectLanguage={this.setLanguage}
            />
          ) : (
            <VocabularyMetadata
              vocabulary={vocabulary}
              location={this.props.location}
              match={this.props.match}
              language={this.state.language}
              selectLanguage={this.setLanguage}
              onChange={this.loadVocabulary}
            />
          )}
        </div>
      </NothingIfEmptyAsset>
    );
  }

  private renderTitle() {
    const vocabulary = this.props.vocabulary;
    const labelClass = classNames({ "text-muted": vocabulary.isSnapshot() });
    return (
      <>
        <VocabularySnapshotIcon vocabulary={vocabulary} />
        <span className={labelClass}>
          {getLocalized(vocabulary.label, this.state.language)}
        </span>
        <SnapshotCreationInfo asset={vocabulary} />
        <CopyIriIcon url={vocabulary.iri} />
        <VocabularyReadOnlyIcon vocabulary={vocabulary} />
      </>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      vocabulary: state.vocabulary,
      configuration: state.configuration,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      loadResource: (iri: IRI) => dispatch(loadResource(iri)),
      loadVocabulary: (iri: IRI) => dispatch(loadVocabulary(iri)),
      requestVocabularyValidation: (vocabularyIri: IRI, stompClient: Client) =>
        dispatch(requestVocabularyValidation(vocabularyIri, stompClient)),
      vocabularyValidation: (message: IMessage, vocabularyIri: string) =>
        dispatch(vocabularyValidation(message, vocabularyIri)),
      updateVocabulary: (vocabulary: Vocabulary) =>
        dispatch(updateVocabulary(vocabulary)),
      removeVocabulary: (vocabulary: Vocabulary) =>
        dispatch(removeVocabulary(vocabulary)),
      importSkos: (iri: IRI, file: File) =>
        dispatch(importIntoExistingVocabulary(iri, file)),
      executeTextAnalysisOnAllTerms: (iri: IRI) =>
        dispatch(executeTextAnalysisOnAllTerms(iri)),
      createSnapshot: (iri: IRI) => dispatch(createVocabularySnapshot(iri)),
      updateDocument: (document: Document) =>
        dispatch(updateResource(document)),
    };
  }
)(
  injectIntl(
    withI18n(
      withStompClient(
        withSubscription(
          VocabularySummary,
          "/user" + Constants.WEBSOCKET_ENDPOINT.VOCABULARIES_VALIDATION,
          { ack: "client" }
        )
      )
    )
  )
);
