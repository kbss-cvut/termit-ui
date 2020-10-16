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

    private renderResultMessage(result : ValidationResult) {
        let message = result.message.find(msg => msg.language === this.props.locale);
        if (!message) message = result.message.find(() => true);
        return <SeverityText severityIri={result.severity.iri} message={message!.value}/>;
    }

    render() {
        let consolidatedResults : ({ [termIri: string] : ValidationResult[]  } | undefined);
        if (this.props.validationResults && this.props.validationResults[this.props.vocabulary.iri]) {
            consolidatedResults = {};
            this.props.validationResults[this.props.vocabulary.iri].forEach(r => {
                // @ts-ignore
                    let results = consolidatedResults[r.term.iri];
                    if ( results === undefined ) {
                        // @ts-ignore
                        consolidatedResults[r.term.iri] = []
                        results = []
                    }
                    results.push(r);
                }
            );
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
                    (consolidatedResults ?
                        Object.keys(consolidatedResults).map( termIri =>
                             <tr key={termIri}>
                                <td><TermIriLink iri={termIri}/></td>
                                <td>
                                    {
                                        consolidatedResults![termIri].map(result => this.renderResultMessage(result) )
                                    }
                                </td>
                            </tr>
                        )
                    : <></> )
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

