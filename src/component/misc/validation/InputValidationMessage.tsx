import React from "react";
import { useI18n } from "../../hook/useI18n";
import ValidationResult, {
  mapToCssClass,
  Severity,
} from "../../../model/form/ValidationResult";
import "./InputValidationMessage.scss";

interface InputValidationMessageProps {
  message: ValidationResult;
}

const InputValidationMessage: React.FC<InputValidationMessageProps> = (
  props
) => {
  const { message } = props;
  const { i18n } = useI18n();
  const tooltip =
    message.severity === Severity.ERROR || message.severity === Severity.WARNING
      ? i18n("validation.message.tooltip")
      : undefined;

  return (
    <li className={mapToCssClass(message.severity)} title={tooltip}>
      {message.messageId ? i18n(message.messageId) : message.message}
    </li>
  );
};

export default InputValidationMessage;
