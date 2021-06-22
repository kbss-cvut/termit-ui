import React from "react";
import { Alert } from "reactstrap";
import ValidationResult, {
  mapToCssClass,
} from "../../../model/form/ValidationResult";
import "./ValidationMessage.scss";

interface ValidationMessageProps {
  result: ValidationResult;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ result }) => (
  <Alert className={mapToCssClass(result.severity)}>{result.message}</Alert>
);

export default ValidationMessage;
