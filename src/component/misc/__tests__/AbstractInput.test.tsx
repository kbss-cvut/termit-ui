import ValidationResult, {
  Severity,
} from "../../../model/form/ValidationResult";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import CustomInput from "../CustomInput";
import * as React from "react";

describe("AbstractInput", () => {
  let onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  beforeEach(() => {
    onChange = vi.fn();
  });

  it("renders validation messages sorted by severity from most severe to warning", () => {
    const validations = [
      new ValidationResult(Severity.WARNING, "warning"),
      new ValidationResult(Severity.BLOCKER, "blocker"),
      new ValidationResult(Severity.ERROR, "error"),
    ];

    const { container } = renderWithIntl(
      <CustomInput
        validation={validations}
        label={"Test"}
        value=""
        onChange={onChange}
      />
    );
    const feedbacks = container.querySelectorAll(".validation-feedback li");
    expect(feedbacks.length).toEqual(validations.length);
    expect(feedbacks[0]).toHaveTextContent("blocker");
    expect(feedbacks[1]).toHaveTextContent("error");
    expect(feedbacks[2]).toHaveTextContent("warning");
  });

  it("does not render form feedback element when no validation results with message are provided", () => {
    const validations = [new ValidationResult(Severity.BLOCKER)];
    const { container } = renderWithIntl(
      <CustomInput
        validation={validations}
        label={"Test"}
        value=""
        onChange={onChange}
      />
    );

    expect(container.querySelector(".validation-feedback")).toBeNull();
  });
});
