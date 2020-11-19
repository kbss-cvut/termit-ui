import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term from "../../model/Term";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadTermAssignmentsInfo} from "../../action/AsyncActions";
import {Table} from "reactstrap";
import TermItState from "../../model/TermItState";
import IntlData from "../../model/IntlData";
import "./TermAssignments.scss";
import Resource, {ResourceData} from "../../model/Resource";
import ResourceLink from "../resource/ResourceLink";
import {TermAssignments as AssignmentInfo} from "../../model/TermAssignments";
import VocabularyUtils from "../../util/VocabularyUtils";
import Utils from "../../util/Utils";

interface TermAssignmentsOwnProps {
    term: Term;
    onLoad: (assignmentsCount: number) => void;
}

interface StoreDispatchProps {
    loadTermAssignments: (term: Term) => Promise<AssignmentInfo[] | any>;
}

interface TermAssignmentsState {
    resources: ResourceData[];
}

type TermAssignmentsProps = TermAssignmentsOwnProps & HasI18n & StoreDispatchProps;

function isOccurrence(item: AssignmentInfo) {
    return Utils.sanitizeArray(item.types).indexOf(VocabularyUtils.TERM_OCCURRENCE) !== -1;
}

function isSuggestedOccurrence(item: AssignmentInfo) {
    return isOccurrence(item) && Utils.sanitizeArray(item.types).indexOf(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE) !== -1;
}

export class TermAssignments extends React.Component<TermAssignmentsProps, TermAssignmentsState> {
    constructor(props: TermAssignmentsProps) {
        super(props);
        this.state = {
            resources: []
        };
    }

    public componentDidMount(): void {
        this.loadAssignments();
    }

    public componentDidUpdate(prevProps: Readonly<TermAssignmentsProps>): void {
        if (this.props.term.iri !== prevProps.term.iri) {
            this.loadAssignments();
        }
    }

    private loadAssignments() {
        this.props.loadTermAssignments(this.props.term)
            .then((assignments: AssignmentInfo[]) => {
                    const resources = assignments
                        .filter(v => !isSuggestedOccurrence(v))
                        .map(v => ({
                            iri: v.resource.iri!,
                            label: v.label
                        }))
                        .filter((item, index, array) =>
                            array.map(c => c.iri).indexOf(item.iri) === index);
                    this.setState({resources});
                    this.props.onLoad(resources.map(a => a.iri!).length);
                }
            );
    }

    public render() {
        const i18n = this.props.i18n;
        if (this.state.resources.length === 0) {
            return <div
                className="additional-metadata-container italics">{i18n("term.metadata.assignments.empty")}</div>;
        }
        return <div className="additional-metadata-container">
            <Table borderless={true}>
                <tbody>
                {this.renderAssignments()}
                </tbody>
            </Table>
        </div>;
    }

    private renderAssignments() {
        const assignmentsPerResource = this.state.resources;
        const result: JSX.Element[] = [];
        assignmentsPerResource
            .forEach((v, k) => {
                    result.push(<tr key={k}>
                        <td>
                            <ResourceLink resource={new Resource(v)}/>
                        </td>
                    </tr>);
            });
        return result;
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
