import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term from "../../model/Term";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadTermAssignmentsInfo} from "../../action/AsyncActions";
import {Badge, Table} from "reactstrap";
import TermItState from "../../model/TermItState";
import IntlData from "../../model/IntlData";
import "./TermAssignments.scss";
import Resource, {ResourceData} from "../../model/Resource";
import ResourceLink from "../resource/ResourceLink";
import {GoCheck, GoX} from "react-icons/go";
import {TermAssignments as AssignmentInfo, TermOccurrences} from "../../model/TermAssignments";
import VocabularyUtils from "../../util/VocabularyUtils";
import Utils from "../../util/Utils";
import InfoIcon from "../misc/InfoIcon";

interface TermAssignmentsOwnProps {
    term: Term;
    onLoad: (assignmentsCount: number) => void;
}

interface StoreDispatchProps {
    loadTermAssignments: (term: Term) => Promise<AssignmentInfo[] | any>;
}

interface TermAssignmentsState {
    assignments: AssignmentInfo[];
}

type TermAssignmentsProps = TermAssignmentsOwnProps & HasI18n & StoreDispatchProps;

function isOccurrence(item: AssignmentInfo) {
    return Utils.sanitizeArray(item.types).indexOf(VocabularyUtils.TERM_OCCURRENCE) !== -1;
}

function isSuggestedOccurrence(item: AssignmentInfo) {
    return Utils.sanitizeArray(item.types).indexOf(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE) !== -1;
}

export class TermAssignments extends React.Component<TermAssignmentsProps, TermAssignmentsState> {
    constructor(props: TermAssignmentsProps) {
        super(props);
        this.state = {
            assignments: []
        };
    }

    public componentDidMount(): void {
        this.props.loadTermAssignments(this.props.term).then((assignments: AssignmentInfo[]) => this.setAssignments(assignments));
    }

    public componentDidUpdate(prevProps: Readonly<TermAssignmentsProps>): void {
        if (this.props.term.iri !== prevProps.term.iri) {
            this.props.loadTermAssignments(this.props.term).then((assignments: AssignmentInfo[]) => this.setAssignments(assignments));
        }
    }

    private setAssignments = (assignments: AssignmentInfo[]) => {
        this.setState({assignments});
        this.props.onLoad(new Set(assignments.map(a => a.resource.iri!)).size);
    };

    public render() {
        const i18n = this.props.i18n;
        if (this.state.assignments.length === 0) {
            return <div
                className="additional-metadata-container italics">{i18n("term.metadata.assignments.empty")}</div>;
        }
        return <div className="additional-metadata-container">
            <Table borderless={true}>
                <thead>
                <tr>
                    <th className="col-xs-9">{i18n("type.resource")}</th>
                    <th className="col-xs-1 text-center">
                        {i18n("term.metadata.assignments.assignment")}
                        <InfoIcon text={i18n("term.metadata.assignments.assignment.help")}
                                  id="term-metadata-assignments-assignment-help" className="ml-1"/>
                    </th>
                    <th className="col-xs-1 text-center">
                        {i18n("term.metadata.assignments.occurrence")}
                        <InfoIcon text={i18n("term.metadata.assignments.occurrence.help")}
                                  id="term-metadata-assignments-occurrence-help" className="ml-1"/>
                    </th>
                    <th className="col-xs-1 text-center">
                        {i18n("term.metadata.assignments.suggestedOccurrence")}
                        <InfoIcon text={i18n("term.metadata.assignments.suggestedOccurrence.help")}
                                  id="term-metadata-assignments-suggestedOccurrence-help" className="ml-1"/>
                    </th>
                </tr>
                </thead>
                <tbody>
                {this.renderAssignments()}
                </tbody>
            </Table>
        </div>;
    }

    private renderAssignments() {
        const assignmentsPerResource = this.mapAssignments();
        const result: JSX.Element[] = [];
        assignmentsPerResource.forEach((v, k) => {
            result.push(<tr key={k}>
                <td>
                    <ResourceLink resource={new Resource(v.resource)}/>
                </td>
                <td className="text-center">
                    {v.assignmentCount > 0 ? <span
                            title={this.props.i18n("term.metadata.assignments.assignment.assigned")}><GoCheck/></span> :
                        <span
                            title={this.props.i18n("term.metadata.assignments.assignment.not.assigned")}><GoX/></span>}
                </td>
                <td className="text-center">
                    {this.renderCheckWithCount(v.occurrenceCount)}
                </td>
                <td className="text-center">
                    {this.renderCheckWithCount(v.suggestedOccurrenceCount)}
                </td>
            </tr>);
        });
        return result;
    }

    private mapAssignments() {
        const assignmentsPerResource = new Map<string, { resource: ResourceData, assignmentCount: number, occurrenceCount: number, suggestedOccurrenceCount: number }>();
        this.state.assignments.forEach(ass => {
            const resIri = ass.resource.iri!;
            let item;
            if (assignmentsPerResource.has(resIri)) {
                item = assignmentsPerResource.get(resIri)!;
            } else {
                item = {
                    resource: {
                        iri: resIri,
                        label: ass.label
                    },
                    assignmentCount: 0,
                    occurrenceCount: 0,
                    suggestedOccurrenceCount: 0
                };
            }
            if (isOccurrence(ass)) {
                if (isSuggestedOccurrence(ass)) {
                    item.suggestedOccurrenceCount = (ass as TermOccurrences).count;
                } else {
                    item.occurrenceCount = (ass as TermOccurrences).count;
                }
            } else {
                item.assignmentCount = 1;
            }
            assignmentsPerResource.set(resIri, item);
        });
        return assignmentsPerResource;
    }

    private renderCheckWithCount(count: number) {
        if (count > 0) {
            return <>
                <GoCheck/>&nbsp;
                <Badge color="secondary" title={this.props.formatMessage("term.metadata.assignments.count.tooltip", {
                    count
                })}>{count}</Badge>
            </>;
        }
        return <span title={this.props.i18n("term.metadata.assignments.count.zero.tooltip")}><GoX/></span>;
    }
}

// NOTE: Need to explicitly pass intl to the component in case of merging props interfaces, otherwise, language
// switching would not work
export default connect<{ intl: IntlData }, StoreDispatchProps, TermAssignmentsOwnProps, TermItState>((state: TermItState) => {
    return {
        intl: state.intl
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadTermAssignments: (term: Term) => dispatch(loadTermAssignmentsInfo(VocabularyUtils.create(term.iri), VocabularyUtils.create(term.vocabulary!.iri!)))
    };
})(injectIntl(withI18n(TermAssignments)));
