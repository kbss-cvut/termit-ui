import * as React from "react";
import { FormGroup, Input } from "reactstrap";
import AbstractInput, { AbstractInputProps } from "./AbstractInput";

export interface TextAreaProps extends AbstractInputProps {
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  rows?: number;
}

export default class TextArea extends AbstractInput<TextAreaProps> {
  protected readonly input: React.RefObject<Input>;

  constructor(props: TextAreaProps) {
    super(props);
    this.input = React.createRef();
  }

  public render() {
    return (
      <FormGroup>
        {this.renderLabel()}
        <Input
          type="textarea"
          style={{ resize: "none" }}
          bsSize="sm"
          ref={this.input}
          {...this.inputProps()}
        />
        {this.renderValidationMessages()}
        {this.renderHint()}
      </FormGroup>
    );
  }
}
