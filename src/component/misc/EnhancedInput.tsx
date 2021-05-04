import * as React from "react";
import { Col, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import AbstractInput, { AbstractInputProps } from "./AbstractInput";

export enum LabelDirection {
  vertical,
  horizontal,
}

export interface EnhancedInputProps extends AbstractInputProps {
  labelWidth?: number;
  inputWidth?: number;
  labelDirection: LabelDirection;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default class EnhancedInputPropsInput extends AbstractInput<EnhancedInputProps> {
  protected input: any;

  public render() {
    const {
      labelWidth,
      inputWidth,
      labelDirection,
      invalidMessage,
      help,
      ...rest
    } = this.props;

    const input = (
      <React.Fragment>
        <Input
          type={this.props.type ? this.props.type : "text"}
          ref={(c: any) => (this.input = c)}
          {...rest}
        />
        <FormFeedback>
          <i className="fas fa-exclamation-triangle" /> {invalidMessage}
        </FormFeedback>
        {this.renderHint()}
      </React.Fragment>
    );

    return (
      <FormGroup row={labelDirection === LabelDirection.horizontal}>
        <Label sm={labelWidth}>{this.props.label}</Label>
        {labelDirection === LabelDirection.horizontal ? (
          <Col sm={inputWidth}>{input}</Col>
        ) : (
          input
        )}
      </FormGroup>
    );
  }
}
