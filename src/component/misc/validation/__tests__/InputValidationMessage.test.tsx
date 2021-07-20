import ValidationResult, {
  Severity,
} from "../../../../model/form/ValidationResult";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import InputValidationMessage from "../InputValidationMessage";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import en from "../../../../i18n/en";

describe("InputValidationMessage", () => {
  it("shows message with tooltip when message has not blocker severity", () => {
    const message = new ValidationResult(Severity.ERROR, "test");
    mockUseI18n();
    const wrapper = mountWithIntl(<InputValidationMessage message={message} />);
    const msg = wrapper.find("li");
    expect(msg.props().title).toBeDefined();
    expect(msg.props().title).toEqual(
      en.messages["validation.message.tooltip"]
    );
  });

  it("does not show validation tooltip when message has blocker severity", () => {
    const message = new ValidationResult(Severity.BLOCKER, "test");
    mockUseI18n();
    const wrapper = mountWithIntl(<InputValidationMessage message={message} />);
    const msg = wrapper.find("li");
    expect(msg.props().title).not.toBeDefined();
  });
});
