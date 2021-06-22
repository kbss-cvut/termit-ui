import * as React from "react";
import FormValidationResult from "../../../model/form/ValidationResult";
import { useSelector } from "react-redux";
import ValidationMessage from "./ValidationMessage";
import TermItState from "../../../model/TermItState";
import Term from "../../../model/Term";
import { useI18n } from "../../hook/useI18n";

interface ValidationResultsProps {
  term: Term;
}

const ValidationResults: React.FC<ValidationResultsProps> = (props) => {
  const { term } = props;
  const validationResults = useSelector(
    (state: TermItState) => state.validationResults[state.vocabulary.iri]
  );
  const { i18n, locale } = useI18n();

  const termResults = (validationResults || [])[term.iri] || [];
  return termResults && termResults.length > 0 ? (
    <div id="validation-result-list" className="additional-metadata-container">
      {termResults.map((result) => {
        const message = FormValidationResult.fromOntoValidationResult(
          result,
          locale
        );
        return <ValidationMessage key={result.iri} result={message} />;
      })}
    </div>
  ) : (
    <div className="additional-metadata-container italics">
      {i18n("term.metadata.validation.empty")}
    </div>
  );
};

export default ValidationResults;
