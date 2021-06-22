import ValidationResult, {
  Severity,
} from "../../../model/form/ValidationResult";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import CustomInput from "../CustomInput";
import InputValidationMessage from "../validation/InputValidationMessage";
import * as React from "react";
import { FormFeedback } from "reactstrap";

describe("AbstractInput", () => {
  let onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  beforeEach(() => {
    onChange = jest.fn();
  });

  it("renders validation messages sorted by severity from most severe to warning", () => {
    const validations = [
      new ValidationResult(Severity.WARNING, "warning"),
      new ValidationResult(Severity.BLOCKER, "blocker"),
      new ValidationResult(Severity.ERROR, "error"),
    ];

    const wrapper = mountWithIntl(
      <CustomInput
        validation={validations}
        label={"Test"}
        value=""
        onChange={onChange}
      />
    );
    const feedbacks = wrapper.find(InputValidationMessage);
    expect(feedbacks.length).toEqual(validations.length);
    expect(feedbacks.at(0).prop("message").severity).toEqual(Severity.BLOCKER);
    expect(feedbacks.at(1).prop("message").severity).toEqual(Severity.ERROR);
    expect(feedbacks.at(2).prop("message").severity).toEqual(Severity.WARNING);
  });

  it("does not render form feedback element when no validation results with message are provided", () => {
    const validations = [new ValidationResult(Severity.BLOCKER)];
    const wrapper = mountWithIntl(
      <CustomInput
        validation={validations}
        label={"Test"}
        value=""
        onChange={onChange}
      />
    );

    expect(wrapper.exists(FormFeedback)).toBeFalsy();
  });
});
