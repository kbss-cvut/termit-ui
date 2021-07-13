import * as React from "react";
import { Input } from "reactstrap";
import AbstractInput, { AbstractInputProps } from "./AbstractInput";

export interface InputProps extends AbstractInputProps {
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  checked?: boolean;
}

export default class CustomCheckBoxInput extends AbstractInput<InputProps> {
  protected input: any;

  public render() {
    const required = this.props.required ? this.props.required : false;
    return (
      <>
        <Input
          type="checkbox"
          ref={(c: any) => (this.input = c)}
          checked={this.props.checked}
          className={this.props.className}
          required={required}
          {...this.inputProps()}
        />
        &nbsp;
        {this.renderLabel()}
        {this.renderValidationMessages()}
        {this.renderHint()}
      </>
    );
  }
}
