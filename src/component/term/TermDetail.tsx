import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {RouteComponentProps, withRouter} from "react-router";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadTerm, loadVocabulary, removeTerm, updateTerm} from "../../action/AsyncActions";
import TermMetadata from "./TermMetadata";
import Term from "../../model/Term";
import TermItState from "../../model/TermItState";
import {Badge, Button} from "reactstrap";
import {GoPencil} from "react-icons/go";
import EditableComponent, {EditableComponentState} from "../misc/EditableComponent";
import TermMetadataEdit from "./TermMetadataEdit";
import Utils from "../../util/Utils";
import AppNotification from "../../model/AppNotification";
import {publishNotification} from "../../action/SyncActions";
import NotificationType from "../../model/NotificationType";
import {IRI} from "../../util/VocabularyUtils";
import * as _ from "lodash";
import HeaderWithActions from "../misc/HeaderWithActions";
import CopyIriIcon from "../misc/CopyIriIcon";
import Vocabulary from "../../model/Vocabulary";
import {FaTrashAlt} from "react-icons/fa";
import RemoveAssetDialog from "../asset/RemoveAssetDialog";
import {getLocalized, getLocalizedPlural} from "../../model/MultilingualString";
import {getShortLocale} from "../../util/IntlUtil";
import LanguageSelector from "../multilingual/LanguageSelector";
import ValidationResult from "../../model/ValidationResult";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";

interface TermDetailProps extends HasI18n, RouteComponentProps<any> {
    term: Term | null;
    vocabulary: Vocabulary;
    loadVocabulary: (iri: IRI) => void;
    loadTerm: (termName: string, vocabularyIri: IRI) => Promise<any>;
    updateTerm: (term: Term) => Promise<any>;
    removeTerm: (term: Term) => Promise<any>;
    publishNotification: (notification: AppNotification) => void;
    validationResults: {[vocabularyIri : string] : ValidationResult[]};
}

export interface TermDetailState extends EditableComponentState {
    validationScore: number | null;
    language: string;
}

export const importantRules = [
    "https://slovník.gov.cz/jazyk/obecný/g4",
    "https://slovník.gov.cz/jazyk/obecný/m1",
    "https://slovník.gov.cz/jazyk/obecný/g13",
    "https://slovník.gov.cz/jazyk/obecný/g14"
];

export class TermDetail extends EditableComponent<TermDetailProps, TermDetailState> {

    constructor(props: TermDetailProps) {
        super(props);
        this.state = {
            edit: false,
            showRemoveDialog: false,
            language: getShortLocale(props.locale),
            validationScore: null
        };
    }

    public componentDidMount(): void {
        this.loadTerm();
        this.loadVocabulary();
    }

    private loadVocabulary(): void {
        const vocabularyName: string = this.props.match.params.name;
        const namespace = Utils.extractQueryParam(this.props.location.search, "namespace");
        this.props.loadVocabulary({fragment: vocabularyName, namespace})
    }

    private loadTerm(): void {
        const vocabularyName: string = this.props.match.params.name;
        const termName: string = this.props.match.params.termName;
        const namespace = Utils.extractQueryParam(this.props.location.search, "namespace");
        this.props.loadTerm(termName, {fragment: vocabularyName, namespace}).then( () => this.loadValidationResults());
    }

    private loadValidationResults = () => {
        (this.props.validationResults && this.props.validationResults[this.props.vocabulary.iri]) ?
         this.computeScore(this.props.validationResults[this.props.vocabulary.iri].filter(result => result.term.iri === this.props.term?.iri)) : this.setBadgeColor(null);
    };

    private computeScore(results: ValidationResult []): void {
        const score = results.reduce((reduceScore, result) => {
            if (importantRules.indexOf(result.sourceShape.iri) >= 0) {
                return reduceScore - 25;
            }
            return reduceScore;
        }, 100);

            this.setState({validationScore : score})
    }

    public componentDidUpdate(prevProps: TermDetailProps) {
        const currTermName = this.props.match.params.termName;
        const prevTermName = prevProps.match.params.termName;
        if (currTermName !== prevTermName) {
            this.onCloseEdit();
            this.loadTerm();
        }
    }

    public setLanguage = (language: string) => {
        this.setState({language});
    };

    public onSave = (term: Term) => {
        const oldTerm = this.props.term!;
        this.props.updateTerm(term).then(() => {
            this.loadTerm();
            this.onCloseEdit();
            if (_.xorBy(oldTerm.parentTerms, Utils.sanitizeArray(term.parentTerms), t => t.iri).length > 0) {
                this.props.publishNotification({source: {type: NotificationType.TERM_HIERARCHY_UPDATED}});
            }
        });
    };

    public onRemove = () => {
        this.props.removeTerm(this.props.term!).then(() => {
            this.onCloseRemove();
        });
    };

    public getButtons = () => {
        const buttons = [];
        if (!this.state.edit) {
            buttons.push(<Button id="term-detail-edit" size="sm" color="primary" onClick={this.onEdit}
                                 key="term-detail-edit"
                                 title={this.props.i18n("edit")}><GoPencil/> {this.props.i18n("edit")}</Button>)
        }
        buttons.push(<Button id="term-detail-remove" key="term.summary.remove" size="sm" color="outline-danger"
                             title={this.props.i18n("asset.remove.tooltip")}
                             onClick={this.onRemoveClick}><FaTrashAlt/>&nbsp;{this.props.i18n("remove")}</Button>);
        if (!this.state.edit) {
            // TODO This will change when editing multilingual strings is supported
            buttons.push(<LanguageSelector key={"term-language-selector"} term={this.props.term}
                                           language={this.state.language} onSelect={this.setLanguage}/>);
        }
        return buttons;
    }

    public setBadgeColor(score: number | null): string {
        switch (score) {
            case 100:
                return "dark-green";
            case 75:
            case 50:
                return "dark-yellow";
            case 25:
            case 0:
                return "dark-red";
            default:
                return "gray";
        }
    }

    public onBadgeClick = () => {
        const normalizedName = this.props.match.params.name;
        const namespace = Utils.extractQueryParam(this.props.location.search, "namespace");
        const queryMap = new Map();
        if (namespace) {
            queryMap.set("namespace", namespace);
        }
        queryMap.set("activeTab", "vocabulary.validation.tab");
        Routing.transitionTo(Routes.vocabularyDetail, {
            params: new Map([["name", normalizedName]]),
            query: queryMap
        });
    }

    public renderBadge() {
            const emptyString = "  ";
            return <Badge color = {this.setBadgeColor(this.state.validationScore)}
                          className="term-quality-badge"
                          title={"The score of this term is "+ this.state.validationScore + "%. Click to see the validation results."}
                          onClick={this.onBadgeClick}
            > {emptyString}
            </Badge>
    }

    public render() {
        const {term, vocabulary} = this.props;
        if (!term) {
            return null;
        }
        const buttons = this.getButtons();
        return <div id="term-detail">
            <HeaderWithActions title={this.renderTitle()} actions={buttons}/>

            <RemoveAssetDialog show={this.state.showRemoveDialog} asset={term}
                               onCancel={this.onCloseRemove} onSubmit={this.onRemove}/>

            {this.state.edit ?
                <TermMetadataEdit save={this.onSave} term={term} cancel={this.onCloseEdit}/> :
                <TermMetadata term={term} vocabulary={vocabulary} language={this.state.language}/>}
        </div>
    }

    private renderTitle() {
        const term = this.props.term!;
        return <>
            {this.state.validationScore? this.renderBadge() : null}
            {getLocalized(term.label, this.state.language)}
            <CopyIriIcon url={term.iri as string}/><br/>
            <h6>{getLocalizedPlural(term.altLabels, this.state.language).sort().join(", ")}</h6>
        </>;
    }
}

export default connect((state: TermItState) => {
    return {
        term: state.selectedTerm,
        vocabulary: state.vocabulary,
        validationResults : state.validationResults
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadVocabulary: (iri: IRI) => dispatch(loadVocabulary(iri)),
        loadTerm: (termName: string, vocabularyIri: IRI) => dispatch(loadTerm(termName, vocabularyIri)),
        updateTerm: (term: Term) => dispatch(updateTerm(term)),
        removeTerm: (term: Term) => dispatch(removeTerm(term)),
        publishNotification: (notification: AppNotification) => dispatch(publishNotification(notification))
    };
})(injectIntl(withI18n(withRouter(TermDetail))));
