import * as React from "react";
import { FormText, Label } from "reactstrap";
import { InputType } from "reactstrap/lib/Input";
import classNames from "classnames";
import HelpIcon from "./HelpIcon";

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
  invalidMessage?: string | JSX.Element;
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

  protected inputProps() {
    const { invalidMessage, help, labelClass, ...p } = this
      .props as AbstractInputProps;
    return p;
  }
}
