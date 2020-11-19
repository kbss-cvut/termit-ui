import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Resource, {EMPTY_RESOURCE} from "../../model/Resource";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadResourceTermAssignmentsInfo} from "../../action/AsyncActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import Term from "../../model/Term";
import {Col, Label, Row} from "reactstrap";
import TermLink from "../term/TermLink";
import {
    ResourceTermAssignments as TermAssignmentInfo,
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
