import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {RouteComponentProps} from "react-router";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import Vocabulary, {EMPTY_VOCABULARY} from "../../model/Vocabulary";
import {exportGlossary, loadVocabulary} from "../../action/AsyncActions";
import VocabularyMetadata from "./VocabularyMetadata";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown} from "reactstrap";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import {GoCloudDownload} from "react-icons/go";
import {ThunkDispatch} from "../../util/Types";
import Utils from "../../util/Utils";
import "./VocabularySummary.scss";
import ExportType from "../../util/ExportType";
import HeaderWithActions from "../misc/HeaderWithActions";
import CopyIriIcon from "../misc/CopyIriIcon";

interface VocabularySummaryProps extends HasI18n, RouteComponentProps<any> {
    vocabulary: Vocabulary;
    loadVocabulary: (iri: IRI) => void;
    exportToCsv: (iri: IRI) => void;
    exportToExcel: (iri: IRI) => void;
    exportToTurtle: (iri: IRI) => void;
}

export class VocabularySummary extends React.Component<VocabularySummaryProps> {

    public componentDidMount(): void {
        this.loadVocabulary();
    }

    public componentDidUpdate(): void {
        if (this.props.vocabulary !== EMPTY_VOCABULARY) {
            this.loadVocabulary();
        }
    }

    private loadVocabulary(): void {
        const normalizedName = this.props.match.params.name;
        const namespace = Utils.extractQueryParam(this.props.location.search, "namespace");
        const iri = VocabularyUtils.create(this.props.vocabulary.iri);
        if (iri.fragment !== normalizedName || (namespace && iri.namespace !== namespace)) {
            this.props.loadVocabulary({fragment: normalizedName, namespace});
        }
    }

    private onExportToCsv = () => {
        this.props.exportToCsv(VocabularyUtils.create(this.props.vocabulary.iri));
    };

    private onExportToExcel = () => {
        this.props.exportToExcel(VocabularyUtils.create(this.props.vocabulary.iri));
    };

    private onExportToTurtle = () => {
        this.props.exportToTurtle(VocabularyUtils.create(this.props.vocabulary.iri));
    };

    public onFileAdded = () => {
        this.loadVocabulary();
    };

    public render() {
        const buttons = [this.renderExportDropdown()];

        return <div id="vocabulary-detail">
            <HeaderWithActions title={
                <>{this.props.vocabulary.label}<CopyIriIcon url={this.props.vocabulary.iri as string}/></>
            } actions={buttons}/>

            <VocabularyMetadata vocabulary={this.props.vocabulary} onFileAdded={this.onFileAdded}
                                location={this.props.location} match={this.props.match}/>
        </div>
    }

    private renderExportDropdown() {
        const i18n = this.props.i18n;
        return <UncontrolledButtonDropdown className="ml-1 mr-2" id="vocabulary-summary-export"
                                           key="vocabulary.summary.export"
                                           size="sm" title={i18n("vocabulary.summary.export.title")}>
            <DropdownToggle caret={false} color="primary" style={{borderRadius: "0.2rem"}}>
                <GoCloudDownload/> <span className="dropdown-toggle">{i18n("vocabulary.summary.export.text")}</span>
            </DropdownToggle>
            <DropdownMenu className="glossary-export-menu">
                <DropdownItem name="vocabulary-export-csv" className="btn-sm" onClick={this.onExportToCsv}
                              title={i18n("vocabulary.summary.export.csv.title")}>{i18n("vocabulary.summary.export.csv")}</DropdownItem>
                <DropdownItem name="vocabulary-export-excel" className="btn-sm" onClick={this.onExportToExcel}
                              title={i18n("vocabulary.summary.export.excel.title")}>{i18n("vocabulary.summary.export.excel")}</DropdownItem>
                <DropdownItem name="vocabulary-export-ttl" className="btn-sm" onClick={this.onExportToTurtle}
                              title={i18n("vocabulary.summary.export.ttl.title")}>{i18n("vocabulary.summary.export.ttl")}</DropdownItem>
            </DropdownMenu>
        </UncontrolledButtonDropdown>;
    }
}

export default connect((state: TermItState) => {
    return {
        vocabulary: state.vocabulary
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadVocabulary: (iri: IRI) => dispatch(loadVocabulary(iri)),
        exportToCsv: (iri: IRI) => dispatch(exportGlossary(iri, ExportType.CSV)),
        exportToExcel: (iri: IRI) => dispatch(exportGlossary(iri, ExportType.Excel)),
        exportToTurtle: (iri: IRI) => dispatch(exportGlossary(iri, ExportType.Turtle))
    };
})(injectIntl(withI18n(VocabularySummary)));
