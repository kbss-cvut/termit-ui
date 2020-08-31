import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Vocabulary from "../../model/Vocabulary";
// @ts-ignore
import {Button, Table} from "reactstrap";
import ValidationResult from "../../model/ValidationResult";
import {injectIntl} from "react-intl";
import {i18n} from "../../__tests__/environment/IntlUtil";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import {loadValidationResults} from "../../action/AsyncActions";

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
        return <div id="validation-result-list">

            <Table>
                <thead>
                <tr>
                    <th>{this.props.i18n('vocabulary.validation.term')}</th>
                    <th>{this.props.i18n('vocabulary.validation.severity')}</th>
                    <th>{this.props.i18n('vocabulary.validation.message')}</th>
                    <th>            <Button id="vocabulary.validate.action" onClick={this.loadValidationResults} color="success"
                                            size="sm">{i18n("vocabulary.validation.action")}</Button></th>
                </tr>
                </thead>
                <tbody>
                {
                    this.state.validationResults.map(r =>
                        <tr key={r.termIri}>
                            <td>{r.termIri}</td>
                            <td>{r.severityKey}</td>
                            <td>{r.message}</td>
                        </tr>
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

