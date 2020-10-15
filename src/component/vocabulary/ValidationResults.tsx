import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Vocabulary from "../../model/Vocabulary";
// @ts-ignore
import {Button, Table} from "reactstrap";
import ValidationResult from "../../model/ValidationResult";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import {loadValidationResults} from "../../action/AsyncActions";
import TermIriLink from "../term/TermIriLink";
import SeverityText from "./SeverityText";

interface ValidationResultsProps extends HasI18n {
    vocabulary: Vocabulary;
    loadValidationResults: ( vocabularyIri : IRI ) => Promise<ValidationResult[]>;
}

interface ValidationResultsState {
    validationResults: ValidationResult[];
}

export class ValidationResults extends React.Component<ValidationResultsProps, ValidationResultsState> {

    constructor(props: ValidationResultsProps) {
        super(props);
        this.state = {validationResults: []};
    }

    private loadValidationResults(): void {
        this.props.loadValidationResults(VocabularyUtils.create(this.props.vocabulary.iri)).then(
            validationResults => this.setState({validationResults})
        );
    }

    public render() {
        const clickValidate = () => this.loadValidationResults();
        return <div id="validation-result-list">

            <Table>
                <thead>
                <tr>
                    <th>{this.props.i18n('vocabulary.validation.term')}</th>
                    <th>{this.props.i18n('vocabulary.validation.message')}</th>
                    <th>            <Button id="vocabulary.validate.action" onClick={clickValidate} color="success"
                                            size="sm">{this.props.i18n("vocabulary.validation.action")}</Button></th>
                </tr>
                </thead>
                <tbody>
                {
                    this.state.validationResults.map(r => {
                        let message = r.message.find(msg => msg.language === this.props.locale);
                        if (!message) message = r.message.find(() => true);
                        return <tr key={JSON.stringify(r.id)}>
                            <td><TermIriLink iri={r.term.iri!}/></td>
                            <td><SeverityText severityIri={r.severity.iri} message={message!.value}/></td>
                        </tr>
                        }
                    )
                }
                </tbody>
            </Table>
        </div>;
    };
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        loadValidationResults: (vocabularyIri : IRI) => dispatch(loadValidationResults(vocabularyIri))
    };
})(injectIntl(withI18n(ValidationResults)));

