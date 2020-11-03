import * as React from "react";
import {injectIntl} from "react-intl";
import classNames from "classnames";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Resource, {EMPTY_RESOURCE} from "../../model/Resource";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadResourceTermAssignmentsInfo} from "../../action/AsyncActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import Term from "../../model/Term";
import {Badge, Col, Label, Row} from "reactstrap";
import TermLink from "../term/TermLink";
import {
    ResourceTermAssignments as TermAssignmentInfo,
    ResourceTermOccurrences
} from "../../model/ResourceTermAssignments";
import Utils from "../../util/Utils";
import AppNotification from "../../model/AppNotification";
import TermItState from "../../model/TermItState";
import NotificationType from "../../model/NotificationType";
import {consumeNotification} from "../../action/SyncActions";
import {langString} from "../../model/MultilingualString";

interface ResourceTermAssignmentsOwnProps {
    resource: Resource;
}

interface ResourceTermAssignmentsStateProps {
    notifications: AppNotification[];
}

interface ResourceTermAssignmentsDispatchProps {
    loadTermAssignments: (resource: Resource) => Promise<TermAssignmentInfo[]>;
    consumeNotification: (notification: AppNotification) => void;
}

interface ResourceTermAssignmentsState {
    assignments: TermAssignmentInfo[];
}

type ResourceTermAssignmentsProps =
    ResourceTermAssignmentsOwnProps
    & ResourceTermAssignmentsStateProps
    & ResourceTermAssignmentsDispatchProps
    & HasI18n;

function isOccurrence(item: TermAssignmentInfo) {
    return Utils.sanitizeArray(item.types).indexOf(VocabularyUtils.TERM_OCCURRENCE) !== -1;
}

function isFile(resource: Resource) {
    return Utils.getPrimaryAssetType(resource) === VocabularyUtils.FILE;
}

export class ResourceTermAssignments extends React.Component<ResourceTermAssignmentsProps, ResourceTermAssignmentsState> {
    constructor(props: ResourceTermAssignmentsProps) {
        super(props);
        this.state = {assignments: []};
    }

    public componentDidMount(): void {
        if (this.props.resource !== EMPTY_RESOURCE) {
            this.loadAssignments();
        }
    }

    public componentDidUpdate(prevProps: Readonly<ResourceTermAssignmentsProps>): void {
        if (prevProps.resource.iri !== this.props.resource.iri && this.props.resource !== EMPTY_RESOURCE) {
            this.setState({assignments: []});
            this.loadAssignments();
            return;
        }
        const analysisFinishedNotification = this.props.notifications.find(n => n.source.type === NotificationType.TEXT_ANALYSIS_FINISHED);
        if (analysisFinishedNotification) {
            this.loadAssignments();
            this.props.consumeNotification(analysisFinishedNotification);
        }
    }

    private loadAssignments() {
        this.props.loadTermAssignments(this.props.resource).then(data => this.setState({assignments: data}));
    }

    public render() {
        const i18n = this.props.i18n;
        const assignments = this.renderAssignedTerms();
        const occurrencesClass = classNames("mt-3", {"m-resource-term-occurrences-container": assignments.length > 0});
        return <>
            <Row>
                <Col xl={2} md={4}>
                    <Label className="attribute-label" title={i18n("resource.metadata.terms.assigned.tooltip")}>
                        {i18n("resource.metadata.terms.assigned")}:
                    </Label>
                </Col>
                <Col xl={10} md={8} id="resource-metadata-term-assignments" className="resource-terms">
                    {assignments}
                </Col>
            </Row>
            {isFile(this.props.resource) && <Row className={occurrencesClass}>
                <Col xl={2} md={4}>
                    <Label className="attribute-label" title={i18n("resource.metadata.terms.occurrences.tooltip")}>
                        {i18n("resource.metadata.terms.occurrences")}:
                    </Label>
                </Col>
                <Col xl={10} md={8} id="resource-metadata-term-occurrences" className="resource-terms">
                    {this.renderTermOccurrences()}
                </Col>
            </Row>}
        </>;
    }

    private renderAssignedTerms() {
        const items: JSX.Element[] = [];
        this.state.assignments.filter(rta => !isOccurrence(rta)).forEach((rta) => {
            items.push(<span key={rta.term.iri} className="resource-term-link m-term-assignment">
                            <TermLink
                                term={new Term({
                                    iri: rta.term.iri,
                                    label: langString(rta.label),
                                    vocabulary: rta.vocabulary,
                                    draft: rta.term.draft
                                })}/>
                        </span>);
        });
        return items;
    }

    private renderTermOccurrences() {
        const items: JSX.Element[] = [];
        const occurrences = new Map<string, { term: Term, suggestedCount: number}>();
        this.state.assignments.filter(isOccurrence).forEach(rta => {
            if (!occurrences.has(rta.term.iri!)) {
                occurrences.set(rta.term.iri!, {
                    term: new Term({
                        iri: rta.term.iri,
                        label: langString(rta.label),
                        vocabulary: rta.vocabulary,
                        draft: rta.term.draft
                    }),
                    suggestedCount: 0
                });
            }
            if (Utils.sanitizeArray(rta.types).indexOf(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE) !== -1) {
                occurrences.get(rta.term.iri!)!.suggestedCount = (rta as ResourceTermOccurrences).count;
            }
        });
        occurrences
            .forEach((v, k) => {
                if ( v.suggestedCount > 0 )
            items.push(<span key={k} className="resource-term-link m-term-occurrence">
                            <TermLink term={v.term}/>
                <Badge title={this.props.i18n("resource.metadata.terms.occurrences.suggested.tooltip")}
                       className="m-term-occurrence-suggested"
                       color="secondary">{this.props.formatMessage("resource.metadata.terms.occurrences.suggested", {count: v.suggestedCount})}</Badge>
                        </span>);
        });
        return items;
    }
}

export default connect<ResourceTermAssignmentsStateProps, ResourceTermAssignmentsDispatchProps, ResourceTermAssignmentsOwnProps, TermItState>((state: TermItState) => {
    return {
        notifications: state.notifications,
        intl: state.intl    // Pass intl in props to force UI re-render on language switch
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadTermAssignments: (resource: Resource) => dispatch(loadResourceTermAssignmentsInfo(VocabularyUtils.create(resource.iri))),
        consumeNotification: (notification: AppNotification) => dispatch(consumeNotification(notification))
    };
})(injectIntl(withI18n(ResourceTermAssignments)));
