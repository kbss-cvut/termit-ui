import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Vocabulary from "../../model/Vocabulary";
// @ts-ignore
import {Table} from "reactstrap";
import ValidationResult from "../../model/ValidationResult";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import TermIriLink from "../term/TermIriLink";
import SeverityText from "./SeverityText";
import TermItState from "../../model/TermItState";

interface ValidationResultsProps extends HasI18n {
    vocabulary: Vocabulary;
    validationResults: {[vocabularyIri : string] : ValidationResult[]};
}

interface ValidationResultsState {
}

export class ValidationResults extends React.Component<ValidationResultsProps, ValidationResultsState> {

    constructor(props: ValidationResultsProps) {
        super(props);
    }

    render() {
        return <div id="validation-result-list">

            <Table>
                <thead>
                <tr>
                    <th>{this.props.i18n('vocabulary.validation.term')}</th>
                    <th>{this.props.i18n('vocabulary.validation.message')}</th>
                </tr>
                </thead>
                <tbody>
                {
                    (this.props.validationResults && this.props.validationResults[this.props.vocabulary.iri]) ?
                        this.props.validationResults[this.props.vocabulary.iri].map(r => {
                                let message = r.message.find(msg => msg.language === this.props.locale);
                                if (!message) message = r.message.find(() => true);
                                return <tr key={JSON.stringify(r.id)}>
                                    <td><TermIriLink iri={r.term.iri!}/></td>
                                    <td><SeverityText severityIri={r.severity.iri} message={message!.value}/></td>
                                </tr>
                            }
                        ) : <></>
                }
                </tbody>
            </Table>
        </div>;
    };
}

export default connect(
    (state: TermItState) => {
    return {
        validationResults : state.validationResults
    };
},{})(injectIntl(withI18n(ValidationResults)));

