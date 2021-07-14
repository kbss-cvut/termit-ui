import { FormGroup, Input } from "reactstrap";
import AbstractInput, { AbstractInputProps } from "./AbstractInput";

export default class Select extends AbstractInput<AbstractInputProps> {
  protected input: any;

  public render() {
    return (
      <FormGroup>
        {this.renderLabel()}
        <Input
          type="select"
          ref={(c: any) => (this.input = c)}
          {...this.inputProps()}
          bsSize="sm"
        >
          {this.props.children}
        </Input>
        {this.renderValidationMessages()}
        {this.renderHint()}
      </FormGroup>
    );
  }
}
