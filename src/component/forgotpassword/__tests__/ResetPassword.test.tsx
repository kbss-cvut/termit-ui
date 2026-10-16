import ActionType from "../../../action/ActionType";
import { MemoryRouter } from "react-router";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import MessageType from "../../../model/MessageType";
import { ResetPassword } from "../ResetPassword";
import { resetPassword } from "../../../action/AsyncUserActions";
import Message from "../../../model/Message";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../../action/AsyncUserActions", () => ({
  ...vi.importActual("../../../action/AsyncUserActions"),
  resetPassword: vi.fn(),
}));

const mockedResetPassword = vi.mocked(resetPassword, true);

describe("ResetPassword", () => {
  beforeEach(() => {
    mockedResetPassword.mockReset().mockReturnValue(() =>
      Promise.resolve({
        message: new Message({ message: "text" }, MessageType.SUCCESS),
        type: ActionType.RESET_PASSWORD,
      })
    );
  });

  const PASSWORD = "UltraSecretPassword123";
  const INVALID_PASSWORD_CONFIRMATION = "NotSoSecretPassword123";
  const EMPTY_STRING = "";

  function renderResetPassword() {
    renderWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );
    return {
      button: screen.getByTestId("resetPassword-submit"),
      passwordInput: screen.getByTestId(
        "resetPassword-password"
      ) as HTMLInputElement,
      passwordConfirmationInput: screen.getByTestId(
        "resetPassword-password-confirm"
      ) as HTMLInputElement,
    };
  }

  it("renders submit button disabled when any field is empty", async () => {
    const user = userEvent.setup();
    const { button, passwordInput, passwordConfirmationInput } =
      renderResetPassword();
    const isAnyEmpty = () =>
      passwordInput.value === EMPTY_STRING ||
      passwordConfirmationInput.value === EMPTY_STRING;
    expect(isAnyEmpty()).toBeTruthy();
    expect(button).toBeDisabled();

    await user.type(passwordInput, PASSWORD);
    expect(isAnyEmpty()).toBeTruthy();
    await user.type(passwordConfirmationInput, PASSWORD);
    expect(isAnyEmpty()).toBeFalsy();
    expect(button).not.toBeDisabled();
  });

  it("renders submit button disabled when passwords dont match", async () => {
    const user = userEvent.setup();
    const { button, passwordInput, passwordConfirmationInput } =
      renderResetPassword();

    expect(button).toBeDisabled();

    await user.type(passwordInput, PASSWORD);
    await user.type(passwordConfirmationInput, PASSWORD);
    await user.clear(passwordConfirmationInput);
    await user.type(passwordConfirmationInput, INVALID_PASSWORD_CONFIRMATION);
    expect(button).toBeDisabled();

    await user.clear(passwordConfirmationInput);
    await user.type(passwordConfirmationInput, PASSWORD);
    await user.clear(passwordInput);
    await user.type(passwordInput, INVALID_PASSWORD_CONFIRMATION);
    expect(button).toBeDisabled();
  });

  it("renders submit button enabled when passwords match", async () => {
    const user = userEvent.setup();
    const { button, passwordInput, passwordConfirmationInput } =
      renderResetPassword();

    await user.type(passwordInput, PASSWORD);
    await user.type(passwordConfirmationInput, PASSWORD);
    expect(button).not.toBeDisabled();

    await user.clear(passwordConfirmationInput);
    await user.type(passwordConfirmationInput, INVALID_PASSWORD_CONFIRMATION);
    await user.clear(passwordInput);
    await user.type(passwordInput, INVALID_PASSWORD_CONFIRMATION);
    expect(button).not.toBeDisabled();
  });

  it("does send form when button is pressed and passwords match", async () => {
    const user = userEvent.setup();
    const { button, passwordInput, passwordConfirmationInput } =
      renderResetPassword();

    await user.type(passwordInput, PASSWORD);
    await user.type(passwordConfirmationInput, PASSWORD);

    expect(passwordInput).toHaveValue(PASSWORD);

    await user.click(button);

    expect(mockedResetPassword).toHaveBeenCalled();
  });

  it("does send form when enter is pressed and passwords match", async () => {
    const user = userEvent.setup();
    const { passwordInput, passwordConfirmationInput } = renderResetPassword();

    await user.type(passwordInput, PASSWORD);
    await user.type(passwordConfirmationInput, PASSWORD);

    expect(passwordInput).toHaveValue(PASSWORD);

    await user.type(passwordInput, "{enter}");

    await waitFor(() => expect(mockedResetPassword).toHaveBeenCalled());
  });

  it("does not send form when enter is pressed and passwords dont match", async () => {
    const user = userEvent.setup();
    const { passwordInput, passwordConfirmationInput } = renderResetPassword();

    await user.type(passwordInput, PASSWORD);
    await user.type(passwordConfirmationInput, INVALID_PASSWORD_CONFIRMATION);

    await user.type(passwordInput, "{enter}");

    expect(passwordInput).toHaveValue(PASSWORD);
    expect(mockedResetPassword).not.toHaveBeenCalled();
  });

  it("disables inputs and button on success request", async () => {
    const user = userEvent.setup();
    const { button, passwordInput, passwordConfirmationInput } =
      renderResetPassword();

    await user.type(passwordInput, PASSWORD);
    await user.type(passwordConfirmationInput, PASSWORD);

    await user.type(passwordConfirmationInput, "{enter}");

    await waitFor(() => expect(button).toBeDisabled());
    expect(passwordInput).toBeDisabled();
    expect(passwordConfirmationInput).toBeDisabled();
  });

  it("clears password inputs on success", async () => {
    const user = userEvent.setup();
    const { passwordInput, passwordConfirmationInput } = renderResetPassword();

    await user.type(passwordInput, PASSWORD);
    await user.type(passwordConfirmationInput, PASSWORD);

    await user.type(passwordConfirmationInput, "{enter}");

    await waitFor(() => expect(passwordInput).toHaveValue(EMPTY_STRING));
    expect(passwordConfirmationInput).toHaveValue(EMPTY_STRING);
    expect(mockedResetPassword).toHaveBeenCalled();
  });

  it("keeps password inputs on failure", async () => {
    mockedResetPassword.mockReturnValue(() =>
      Promise.resolve({
        message: new Message({ messageId: "error.message" }, MessageType.ERROR),
        type: ActionType.REQUEST_PASSWORD_RESET,
      })
    );

    const user = userEvent.setup();
    const { passwordInput, passwordConfirmationInput } = renderResetPassword();

    await user.type(passwordInput, PASSWORD);
    await user.type(passwordConfirmationInput, PASSWORD);

    await user.type(passwordConfirmationInput, "{enter}");

    await waitFor(() => expect(mockedResetPassword).toHaveBeenCalled());
    expect(passwordInput).toHaveValue(PASSWORD);
    expect(passwordConfirmationInput).toHaveValue(PASSWORD);
  });
});
