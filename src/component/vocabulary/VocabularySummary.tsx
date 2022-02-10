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
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { GoClippy, GoCloudDownload, GoPencil } from "react-icons/go";
import VocabularyUtils, { IRI, IRIImpl } from "../../util/VocabularyUtils";
import { ThunkDispatch } from "../../util/Types";
import EditableComponent, {
  EditableComponentState,
} from "../misc/EditableComponent";
import VocabularyEdit from "./VocabularyEdit";
import VocabularyMetadata from "./VocabularyMetadata";
import Utils from "../../util/Utils";
import ExportType from "../../util/ExportType";
import HeaderWithActions from "../misc/HeaderWithActions";
import CopyIriIcon from "../misc/CopyIriIcon";
import { FaTrashAlt } from "react-icons/fa";
import RemoveAssetDialog from "../asset/RemoveAssetDialog";
import WindowTitle from "../misc/WindowTitle";
import IfUserAuthorized from "../authorization/IfUserAuthorized";
import ImportBackupOfVocabulary from "./ImportBackupOfVocabulary";
import { importSkosIntoExistingVocabulary } from "../../action/AsyncImportActions";
import {
  exportGlossary,
  exportGlossaryWithExactMatchReferences,
} from "../../action/AsyncVocabularyActions";
import "./VocabularySummary.scss";

interface VocabularySummaryProps extends HasI18n, RouteComponentProps<any> {
  vocabulary: Vocabulary;
  loadResource: (iri: IRI) => void;
  loadVocabulary: (iri: IRI) => Promise<any>;
  updateVocabulary: (vocabulary: Vocabulary) => Promise<any>;
  removeVocabulary: (vocabulary: Vocabulary) => Promise<any>;
  validateVocabulary: (iri: IRI) => Promise<any>;
  importSkos: (iri: IRI, file: File, rename: Boolean) => Promise<any>;
  exportToCsv: (iri: IRI) => void;
  exportToExcel: (iri: IRI) => void;
  exportToTurtle: (iri: IRI) => void;
  exportWithReferences: (iri: IRI) => void;
  executeTextAnalysisOnAllTerms: (iri: IRI) => void;
}

export interface VocabularySummaryState extends EditableComponentState {
  selectDocumentDialogOpen: boolean;
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
    const normalizedName = this.props.match.params.name;
    const namespace = Utils.extractQueryParam(
      this.props.location.search,
      "namespace"
    );
    const iri = VocabularyUtils.create(this.props.vocabulary.iri);
    if (
      iri.fragment !== normalizedName ||
      (namespace && iri.namespace !== namespace)
    ) {
      this.props.loadVocabulary(
        IRIImpl.create({ fragment: normalizedName, namespace })
      );
    }
  };

  public onSave = (vocabulary: Vocabulary) => {
    this.props.updateVocabulary(vocabulary).then(() => {
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

  private onExportToCsv = () =>
    this.props.exportToCsv(VocabularyUtils.create(this.props.vocabulary.iri));

  private onExportToExcel = () =>
    this.props.exportToExcel(VocabularyUtils.create(this.props.vocabulary.iri));

  private onExportToTurtle = () =>
    this.props.exportToTurtle(
      VocabularyUtils.create(this.props.vocabulary.iri)
    );

  private onExportWithReferences = () =>
    this.props.exportWithReferences(
      VocabularyUtils.create(this.props.vocabulary.iri)
    );

  private onImport = (file: File, rename: Boolean) =>
    this.props.importSkos(
      VocabularyUtils.create(this.props.vocabulary.iri),
      file,
      rename
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
        <IfUserAuthorized
          key="vocabulary-summary-edit"
          renderUnauthorizedAlert={false}
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
        </IfUserAuthorized>
      );
    }
    buttons.push(
      <ImportBackupOfVocabulary
        key="vocabulary.summary.import"
        performAction={this.onImport}
      />
    );
    buttons.push(this.renderExportDropdown());
    buttons.push(
      <IfUserAuthorized
        key="vocabulary-summary-remove"
        renderUnauthorizedAlert={false}
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
      </IfUserAuthorized>
    );
    buttons.push(this.renderAnalyzeButton());

    return (
      <div id="vocabulary-detail">
        <WindowTitle
          title={`${vocabulary.label} | ${i18n(
            "vocabulary.management.vocabularies"
          )}`}
        />
        <HeaderWithActions
          title={
            <>
              {vocabulary.label}
              <CopyIriIcon url={vocabulary.iri as string} />
            </>
          }
          actions={buttons}
        />
        <RemoveAssetDialog
          show={this.state.showRemoveDialog}
          asset={vocabulary}
          onCancel={this.onCloseRemove}
          onSubmit={this.onRemove}
        />

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

  private renderExportDropdown() {
    const i18n = this.props.i18n;
    return (
      <UncontrolledButtonDropdown
        id="vocabulary-summary-export"
        className="ml-0"
        key="vocabulary.summary.export"
        size="sm"
        title={i18n("vocabulary.summary.export.title")}
      >
        <DropdownToggle
          caret={false}
          color="primary"
          style={{ borderRadius: "0.2rem" }}
        >
          <GoCloudDownload />{" "}
          <span className="dropdown-toggle">
            {i18n("vocabulary.summary.export.text")}
          </span>
        </DropdownToggle>
        <DropdownMenu className="glossary-export-menu">
          <DropdownItem
            name="vocabulary-export-csv"
            className="btn-sm"
            onClick={this.onExportToCsv}
            title={i18n("vocabulary.summary.export.csv.title")}
          >
            {i18n("vocabulary.summary.export.csv")}
          </DropdownItem>
          <DropdownItem
            name="vocabulary-export-excel"
            className="btn-sm"
            onClick={this.onExportToExcel}
            title={i18n("vocabulary.summary.export.excel.title")}
          >
            {i18n("vocabulary.summary.export.excel")}
          </DropdownItem>
          <DropdownItem
            name="vocabulary-export-ttl"
            className="btn-sm"
            onClick={this.onExportToTurtle}
            title={i18n("vocabulary.summary.export.ttl.title")}
          >
            {i18n("vocabulary.summary.export.ttl")}
          </DropdownItem>
          <DropdownItem
            name="vocabulary-export-ttl-with-references"
            className="btn-sm"
            onClick={this.onExportWithReferences}
            title={i18n("vocabulary.summary.export.ttl.withRefs.title")}
          >
            {i18n("vocabulary.summary.export.ttl.withRefs")}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
    );
  }

  private renderAnalyzeButton() {
    return (
      <IfUserAuthorized
        renderUnauthorizedAlert={false}
        key="analyze-definition"
      >
        <Button
          id="analyze-definition"
          size="sm"
          color="primary"
          title={this.props.i18n("vocabulary.summary.startTextAnalysis.title")}
          onClick={this.onExecuteTextAnalysisOnAllTerms}
        >
          <GoClippy />
          &nbsp;{this.props.i18n("file.metadata.startTextAnalysis.text")}
        </Button>
      </IfUserAuthorized>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      vocabulary: state.vocabulary,
      validationResults: state.validationResults[state.vocabulary.iri],
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
      importSkos: (iri: IRI, file: File, rename: Boolean) =>
        dispatch(importSkosIntoExistingVocabulary(iri, file, rename)),
      exportToCsv: (iri: IRI) => dispatch(exportGlossary(iri, ExportType.CSV)),
      exportToExcel: (iri: IRI) =>
        dispatch(exportGlossary(iri, ExportType.Excel)),
      exportToTurtle: (iri: IRI) =>
        dispatch(exportGlossary(iri, ExportType.Turtle)),
      exportWithReferences: (iri: IRI) =>
        dispatch(exportGlossaryWithExactMatchReferences(iri)),
      executeTextAnalysisOnAllTerms: (iri: IRI) =>
        dispatch(executeTextAnalysisOnAllTerms(iri)),
    };
  }
)(injectIntl(withI18n(VocabularySummary)));
