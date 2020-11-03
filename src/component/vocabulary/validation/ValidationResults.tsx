import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import Vocabulary from "../../../model/Vocabulary";
// @ts-ignore
import {Table} from "reactstrap";
import ValidationResult from "../../../model/ValidationResult";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import TermIriLink from "../../term/TermIriLink";
import SeverityText from "./SeverityText";
import TermItState from "../../../model/TermItState";

interface ValidationResultsProps extends HasI18n {
    vocabulary: Vocabulary;
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

    private renderRow(termIri: string, results: ValidationResult[]) {
        return <tr key={termIri}>
            <td><TermIriLink iri={termIri}/></td>
            <td>
                {
                    results.map(result => this.renderResultMessage(result))
                }
            </td>
        </tr>
    }

    private consolidateResults(validationResults: ValidationResult[]) {
        const consolidatedResults = {};
        validationResults.forEach(r => {
            consolidatedResults![r.term.iri!] = consolidatedResults![r.term.iri!] || [];
            consolidatedResults![r.term.iri!].push(r);
        });
        return consolidatedResults;
    }

    render() {
        let consolidatedResults: { [termIri: string]: ValidationResult[] } | undefined;
        if (this.props.validationResults && this.props.validationResults[this.props.vocabulary.iri]) {
            consolidatedResults = this.consolidateResults(this.props.validationResults[this.props.vocabulary.iri]);
        }

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
                    consolidatedResults ?
                        Object.keys(consolidatedResults).sort( (r1: string, r2: string) =>
                             consolidatedResults![r2].length - consolidatedResults![r1].length
                        )
                            .map(termIri => this.renderRow(termIri, consolidatedResults![termIri]))
                        : <></>
                }
                </tbody>
            </Table>
        </div>;
    };
}

export default connect(
    (state: TermItState) => {
        return {
            validationResults: state.validationResults
        };
    }, {})
(injectIntl(withI18n(ValidationResults)));

