import * as React from "react";
import { Input, FormGroup } from "reactstrap";
import AbstractInput, { AbstractInputProps } from "./AbstractInput";
import { FormFeedback } from "reactstrap";

export interface InputProps extends AbstractInputProps {
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default class CustomInput extends AbstractInput<InputProps> {
  protected input: any;

  public render() {
    const required = this.props.required ? this.props.required : false;
    return (
      <FormGroup>
        {this.renderLabel()}
        <Input
          type={this.props.type ? this.props.type : "text"}
          ref={(c: any) => (this.input = c)}
          required={required}
          bsSize="sm"
          {...this.inputProps()}
        />
        <FormFeedback>{this.props.invalidMessage}</FormFeedback>
        {this.renderHelp()}
      </FormGroup>
    );
  }
}
