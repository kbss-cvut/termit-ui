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
import ValidationResult from "../../model/ValidationResult";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import {getShortLocale} from "../../util/IntlUtil";

export interface CommonTermDetailProps extends HasI18n {
    configuredLanguage: string;
    term: Term | null;
    vocabulary: Vocabulary;
    loadVocabulary: (iri: IRI) => void;
    loadTerm: (termName: string, vocabularyIri: IRI) => void;
}

interface TermDetailProps extends CommonTermDetailProps, RouteComponentProps<any> {
    updateTerm: (term: Term) => Promise<any>;
    removeTerm: (term: Term) => Promise<any>;
    publishNotification: (notification: AppNotification) => void;
    validationResults: { [vocabularyIri: string]: ValidationResult[] };
}

export interface TermDetailState extends EditableComponentState {
    language: string;
}

export const importantRules = [
    "https://slovník.gov.cz/jazyk/obecný/g4",
    "https://slovník.gov.cz/jazyk/obecný/m1",
    "https://slovník.gov.cz/jazyk/obecný/g13",
    "https://slovník.gov.cz/jazyk/obecný/g14"
];

export function resolveInitialLanguage(props: CommonTermDetailProps) {
    const {term, configuredLanguage, locale} = props;
    const supported = term ? Term.getLanguages(term) : [];
    const langLocale = getShortLocale(locale);
    return supported.indexOf(langLocale) !== -1 ? langLocale : configuredLanguage;
}

export class TermDetail extends EditableComponent<TermDetailProps, TermDetailState> {

    constructor(props: TermDetailProps) {
        super(props);
        this.state = {
            edit: false,
            showRemoveDialog: false,
            language: resolveInitialLanguage(props)
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
        this.props.loadTerm(termName, {fragment: vocabularyName, namespace});
    }

    private computeScore(results: ValidationResult []): number | undefined {
        return results.reduce((reduceScore, result) => {
            if (importantRules.indexOf(result.sourceShape?.iri) >= 0) {
                return reduceScore - 25;
            }
            return reduceScore;
        }, 100);
    }

    public componentDidUpdate(prevProps: TermDetailProps) {
        const currTermName = this.props.match.params.termName;
        const prevTermName = prevProps.match.params.termName;
        if (currTermName !== prevTermName) {
            this.onCloseEdit();
            this.loadTerm();
        }
        if (prevProps.term?.iri !== this.props.term?.iri) {
            this.setState({language: resolveInitialLanguage(this.props)});
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

    public getActions = () => {
        const actions = [];
        if (!this.state.edit) {
            actions.push(<Button id="term-detail-edit" size="sm" color="primary" onClick={this.onEdit}
                                 key="term-detail-edit"
                                 title={this.props.i18n("edit")}><GoPencil/> {this.props.i18n("edit")}</Button>)
        }
        actions.push(<Button id="term-detail-remove" key="term.summary.remove" size="sm" color="outline-danger"
                             title={this.props.i18n("asset.remove.tooltip")}
                             onClick={this.onRemoveClick}><FaTrashAlt/>&nbsp;{this.props.i18n("remove")}</Button>);
        return actions;
    }

    public setBadgeColor(score: number | undefined): string {
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
        let score: number | undefined;
        if (this.props.validationResults && this.props.validationResults[this.props.vocabulary.iri]) {
            score = this.computeScore(this.props.validationResults[this.props.vocabulary.iri].filter(result => result.term.iri === this.props.term?.iri));
        }
        return <Badge color={this.setBadgeColor(score)}
                      className="term-quality-badge"
                      title={(score !== undefined) ? this.props.formatMessage("term.badge.score.tooltip", {score}) : this.props.i18n("term.badge.no-score.tooltip")}
                      onClick={this.onBadgeClick}
        >&nbsp;
        </Badge>;
    }

    public render() {
        const {term, vocabulary} = this.props;
        if (!term) {
            return null;
        }
        const buttons = this.getActions();
        return <div id="term-detail">
            <HeaderWithActions title={this.renderTitle()} actions={buttons}/>

            <RemoveAssetDialog show={this.state.showRemoveDialog} asset={term}
                               onCancel={this.onCloseRemove} onSubmit={this.onRemove}/>
            {this.state.edit ?
                <TermMetadataEdit save={this.onSave} term={term} cancel={this.onCloseEdit}
                                  language={this.state.language} selectLanguage={this.setLanguage}/> :
                <TermMetadata term={term} vocabulary={vocabulary} language={this.state.language}
                              selectLanguage={this.setLanguage}/>}
        </div>
    }

    private renderTitle() {
        const term = this.props.term!;
        const altLabels = getLocalizedPlural(term.altLabels, this.state.language).sort().join(", ");
        return <>
            {this.renderBadge()}
            {getLocalized(term.label, this.state.language)}
            <CopyIriIcon url={term.iri as string}/><br/>
            <div className="small italics">{altLabels.length > 0 ? altLabels : "\u00a0"}</div>
        </>;
    }
}

export default connect((state: TermItState) => {
    return {
        term: state.selectedTerm,
        vocabulary: state.vocabulary,
        configuredLanguage: state.configuration.language,
        validationResults: state.validationResults
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
