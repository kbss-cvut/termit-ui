import * as React from "react";
import {FormFeedback, FormText, Label} from "reactstrap";
import { InputType } from "reactstrap/lib/Input";
import classNames from "classnames";
import HelpIcon from "./HelpIcon";
import {useI18n} from "../hook/useI18n";

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
  valid?: boolean;
  invalid?: boolean;
  /**
   * Indicates why the input value is invalid. Should prevent a form from being submitted.
   */
  invalidMessage?: string | JSX.Element;
  /**
   * Message from the quality validation mechanism. Should not prevent a form from being submitted.
   */
  validationMessage?: string | JSX.Element;
  autoFocus?: boolean;
  autoComplete?: string;
  type?: InputType;
  disabled?: boolean;
  readOnly?: boolean;
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
    return this.props.help ? (
      <HelpIcon id={this.props.name!} text={this.props.help!} />
    ) : null;
  }

  protected renderHint() {
    return this.props.hint ? <FormText>{this.props.hint}</FormText> : null;
  }

  protected renderValidationMessage() {
    return this.props.validationMessage && <ValidationMessage>{this.props.validationMessage}</ValidationMessage>;
  }

  protected inputProps() {
    const { invalidMessage, help, labelClass, validationMessage, ...p } = this
      .props as AbstractInputProps;
    return p;
  }
}

/**
 * Separate component allows us to easily access i18n.
 */
const ValidationMessage:React.FC = props => {
  const {i18n} = useI18n();
  return <FormFeedback className="validation-feedback" title={i18n("validation.message.tooltip")}>{props.children}</FormFeedback>;
}
