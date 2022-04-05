import * as React from "react";
import { FormFeedback, FormText, Label } from "reactstrap";
import { InputType } from "reactstrap/lib/Input";
import classNames from "classnames";
import HelpIcon from "./HelpIcon";
import ValidationResult, {
  Severity,
  severityComparator,
} from "../../model/form/ValidationResult";
import Utils from "../../util/Utils";
import InputValidationMessage from "./validation/InputValidationMessage";

export interface AbstractInputProps {
  name?: string;
  label?: string | JSX.Element;
  labelClass?: string;
  placeholder?: string;
  title?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Hint text is displayed under the input field in a smaller, muted font.
   *
   * Hint text should be short, not disturbing.
   */
  hint?: string;
  /**
   * Help is displayed in a popup on hover/click on the help icon displayed next to the input label.
   *
   * Help text may be longer and contain detailed explanation of more complex concepts.
   */
  help?: string;
  validation?: ValidationResult | ValidationResult[];
  autoFocus?: boolean;
  autoComplete?: string;
  type?: InputType;
  disabled?: boolean;
  readOnly?: boolean;
}

export function renderHelp(id: string, help?: string) {
  return help && <HelpIcon id={id} text={help} />;
}

export function renderHint(hint?: string | JSX.Element) {
  return hint && <FormText>{hint}</FormText>;
}

export function renderValidationMessages(messages: ValidationResult[]) {
  if (messages.length === 0) {
    return null;
  }
  messages.sort(severityComparator);
  return (
    <FormFeedback className="validation-feedback">
      <ul className="list-unstyled mb-0">
        {messages.map((m, i) => (
          <InputValidationMessage key={`${m.severity}-${i}`} message={m} />
        ))}
      </ul>
    </FormFeedback>
  );
}

export default class AbstractInput<
  T extends AbstractInputProps
> extends React.Component<T> {
  protected renderLabel() {
    return this.props.label ? (
      <Label className={classNames("attribute-label", this.props.labelClass)}>
        {this.props.label}
        {this.renderHelp()}
      </Label>
    ) : null;
  }

  private renderHelp() {
    return renderHelp(
      this.props.name || Date.now().toString(),
      this.props.help
    );
  }

  protected renderHint() {
    return renderHint(this.props.hint);
  }

  protected renderValidationMessages() {
    const messages = Utils.sanitizeArray(this.props.validation).filter(
      (m) => m.message !== undefined
    );
    return renderValidationMessages(messages);
  }

  protected isValid() {
    return (
      Utils.sanitizeArray(this.props.validation).find(
        (vr) => vr.severity === Severity.VALID
      ) !== undefined
    );
  }

  protected isInvalid() {
    return (
      Utils.sanitizeArray(this.props.validation).find(
        (vr) => vr.severity === Severity.BLOCKER
      ) !== undefined
    );
  }

  protected inputProps() {
    const { help, labelClass, validation, ...p } = this
      .props as AbstractInputProps;
    return p;
  }
}
