import { Alert } from "reactstrap";
import { ValidationUtils } from "./ValidationUtils";
import "./ValidationMessage.scss";

interface ValidationMessageProps {
  sourceShapeIri: string;
  message: string;
}

const ValidationMessage = (props: ValidationMessageProps) => (
    <Alert
      className={ValidationUtils.getMessageClass(ValidationUtils.toSeverity(props.sourceShapeIri))}
    >
      {props.message}
    </Alert>
  );

export default ValidationMessage;
