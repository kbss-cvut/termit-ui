import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
// @ts-ignore
import {Table} from "reactstrap";
import ValidationResult from "../../../model/ValidationResult";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import SeverityText from "./SeverityText";
import TermItState from "../../../model/TermItState";
import Term from "../../../model/Term";

interface ValidationResultsProps extends HasI18n {
    term: Term;
    validationResults: { [vocabularyIri: string]: ValidationResult[] };
}

export class ValidationResults extends React.Component<ValidationResultsProps> {

    private renderResultMessage(result: ValidationResult) {
        let message;
        if (Array.isArray(result.message)) {
            message = result.message.find(msg => msg.language === this.props.locale);
            if (!message) message = result.message.find(() => true);
        } else {
            message = result.message;
        }
        return <SeverityText key={result.id} severityIri={result.severity.iri} message={message!.value}/>;
    }

    render() {
        const termResults = (this.props.validationResults || [])[this.props.term.iri] || [];

        return <div id="validation-result-list">
            <Table>
                <tbody>
                {
                    termResults.map(result => this.renderResultMessage(result))
                }
                </tbody>
            </Table>
        </div>;
    };
}

export default connect(
    (state: TermItState) => {
        return {
            validationResults: state.validationResults[state.vocabulary.iri]
        };
    }, {})
(injectIntl(withI18n(ValidationResults)));

