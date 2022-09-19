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
  updateVocabulary,
  validateVocabulary,
} from "../../action/AsyncActions";
import { Button } from "reactstrap";
import { GoPencil } from "react-icons/go";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
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
import RemoveAssetDialog from "../asset/RemoveAssetDialog";
import WindowTitle from "../misc/WindowTitle";
import { importSkosIntoExistingVocabulary } from "../../action/AsyncImportActions";
import "./VocabularySummary.scss";
import VocabularyActions from "./VocabularyActions";
import ExportVocabularyDialog from "./ExportVocabularyDialog";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { createVocabularySnapshot } from "../../action/AsyncVocabularyActions";
import { trackPromise } from "react-promise-tracker";
import VocabularyReadOnlyIcon from "./authorization/VocabularyReadOnlyIcon";
import IfVocabularyEditAuthorized from "./authorization/IfVocabularyEditAuthorized";
import { Configuration } from "../../model/Configuration";
import VocabularySnapshotIcon from "./snapshot/VocabularySnapshotIcon";
import CreateSnapshotDialog from "./CreateSnapshotDialog";
import classNames from "classnames";
import SnapshotCreationInfo from "../snapshot/SnapshotCreationInfo";

interface VocabularySummaryProps extends HasI18n, RouteComponentProps<any> {
  vocabulary: Vocabulary;
  configuration: Configuration;
  loadResource: (iri: IRI) => void;
  loadVocabulary: (iri: IRI) => Promise<any>;
  updateVocabulary: (vocabulary: Vocabulary) => Promise<any>;
  removeVocabulary: (vocabulary: Vocabulary) => Promise<any>;
  validateVocabulary: (iri: IRI) => Promise<any>;
  importSkos: (iri: IRI, file: File) => Promise<any>;
  executeTextAnalysisOnAllTerms: (iri: IRI) => void;
  createSnapshot: (iri: IRI) => Promise<any>;
}

export interface VocabularySummaryState extends EditableComponentState {
  selectDocumentDialogOpen: boolean;
  showExportDialog: boolean;
  showSnapshotDialog: boolean;
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
    };
  }

  public componentDidMount(): void {
    this.loadVocabulary();
  }

  public componentDidUpdate(prevProps: Readonly<VocabularySummaryProps>): void {
    if (this.props.vocabulary !== EMPTY_VOCABULARY) {
      this.loadVocabulary();
    }
    if (prevProps.vocabulary.iri !== this.props.vocabulary.iri) {
      this.onCloseEdit();
    }
  }

  public loadVocabulary = () => {
    const iriFromUrl = Utils.resolveVocabularyIriFromRoute(
      this.props.match.params,
      this.props.location.search,
      this.props.configuration
    );
    const iri = VocabularyUtils.create(this.props.vocabulary.iri);
    if (
      iri.fragment !== iriFromUrl.fragment ||
      (iriFromUrl.namespace && iri.namespace !== iriFromUrl.namespace)
    ) {
      trackPromise(this.props.loadVocabulary(iriFromUrl), "vocabulary-summary");
    }
  };

  public onSave = (vocabulary: Vocabulary) => {
    trackPromise(
      this.props.updateVocabulary(vocabulary),
      "vocabulary-summary"
    ).then(() => {
      this.onCloseEdit();
      this.props.loadVocabulary(VocabularyUtils.create(vocabulary.iri));
    });
  };

  public onRemove = () => {
    this.props.removeVocabulary(this.props.vocabulary).then(() => {
      this.onCloseRemove();
    });
  };

  public onValidate = () => {
    this.props.validateVocabulary(
      VocabularyUtils.create(this.props.vocabulary.iri)
    );
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
        <IfVocabularyEditAuthorized
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
        </IfVocabularyEditAuthorized>
      );
    }
    buttons.push(
      <IfVocabularyEditAuthorized
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
      </IfVocabularyEditAuthorized>
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
      <div id="vocabulary-detail">
        <WindowTitle
          title={`${vocabulary.label} | ${i18n(
            "vocabulary.management.vocabularies"
          )}`}
        />
        <HeaderWithActions title={this.renderTitle()} actions={buttons} />
        <RemoveAssetDialog
          show={this.state.showRemoveDialog}
          asset={vocabulary}
          onCancel={this.onCloseRemove}
          onSubmit={this.onRemove}
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
            cancel={this.onCloseEdit}
            vocabulary={vocabulary}
          />
        ) : (
          <VocabularyMetadata
            vocabulary={vocabulary}
            location={this.props.location}
            match={this.props.match}
            onChange={this.loadVocabulary}
          />
        )}
      </div>
    );
  }

  private renderTitle() {
    const vocabulary = this.props.vocabulary;
    const labelClass = classNames({ "text-muted": vocabulary.isSnapshot() });
    return (
      <>
        <VocabularySnapshotIcon vocabulary={vocabulary} />
        <span className={labelClass}>{vocabulary.label}</span>
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
      updateVocabulary: (vocabulary: Vocabulary) =>
        dispatch(updateVocabulary(vocabulary)),
      removeVocabulary: (vocabulary: Vocabulary) =>
        dispatch(removeVocabulary(vocabulary)),
      validateVocabulary: (iri: IRI) => dispatch(validateVocabulary(iri)),
      importSkos: (iri: IRI, file: File) =>
        dispatch(importSkosIntoExistingVocabulary(iri, file)),
      executeTextAnalysisOnAllTerms: (iri: IRI) =>
        dispatch(executeTextAnalysisOnAllTerms(iri)),
      createSnapshot: (iri: IRI) => dispatch(createVocabularySnapshot(iri)),
    };
  }
)(injectIntl(withI18n(VocabularySummary)));
