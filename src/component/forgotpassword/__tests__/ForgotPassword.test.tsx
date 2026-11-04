import ActionType from "../../../action/ActionType";
import { MemoryRouter } from "react-router";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { ForgotPassword } from "../ForgotPassword";
import MessageType from "../../../model/MessageType";
import { requestPasswordReset } from "../../../action/AsyncUserActions";
import Message from "../../../model/Message";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";

vi.mock("../../../action/AsyncUserActions", () => ({
  ...vi.importActual("../../../action/AsyncUserActions"),
  requestPasswordReset: vi.fn(),
}));

const mockedRequestPasswordReset = vi.mocked(requestPasswordReset, true);

describe("ForgotPassword", () => {
  const INVALID_EMAIL = "invalid@email";
  const VALID_EMAIL = "valid@kbss.fel.cvut.cz";
  const EMPTY_STRING = "";

  beforeEach(() => {
    mockedRequestPasswordReset.mockReset().mockReturnValue(() =>
      Promise.resolve({
        message: new Message({ message: "text" }, MessageType.SUCCESS),
        type: ActionType.REQUEST_PASSWORD_RESET,
      })
    );
  });

  it("renders submit button disabled when username field is empty", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const button = screen.getByTestId("forgotPassword-submit");
    const usernameInput = screen.getByTestId("forgotPassword-username");
    expect(usernameInput).toHaveValue(EMPTY_STRING);
    expect(button).toBeDisabled();

    await user.type(usernameInput, VALID_EMAIL);
    expect(usernameInput).toHaveValue(VALID_EMAIL);
    await user.clear(usernameInput);
    expect(button).toBeDisabled();

    await user.type(usernameInput, VALID_EMAIL);
    await user.clear(usernameInput);
    expect(button).toBeDisabled();
    expect(usernameInput).toHaveValue(EMPTY_STRING);
  });

  it("renders submit button disabled when username field is not valid email", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const button = screen.getByTestId("forgotPassword-submit");
    const usernameInput = screen.getByTestId("forgotPassword-username");
    expect(usernameInput).toHaveValue("");
    expect(button).toBeDisabled();

    await user.type(usernameInput, VALID_EMAIL);
    expect(button).not.toBeDisabled();

    await user.clear(usernameInput);
    await user.type(usernameInput, INVALID_EMAIL);
    expect(button).toBeDisabled();

    await user.clear(usernameInput);
    await user.type(usernameInput, VALID_EMAIL);
    expect(button).not.toBeDisabled();
    expect(usernameInput).toHaveValue(VALID_EMAIL);
  });

  it("does send form when button is pressed and username is valid", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const button = screen.getByTestId("forgotPassword-submit");
    const usernameInput = screen.getByTestId("forgotPassword-username");

    await user.type(usernameInput, VALID_EMAIL);
    expect(usernameInput).toHaveValue(VALID_EMAIL);

    await user.click(button);

    expect(mockedRequestPasswordReset).toHaveBeenCalled();
  });

  it("does send form when enter is pressed and username is valid", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const usernameInput = screen.getByTestId("forgotPassword-username");

    await user.type(usernameInput, VALID_EMAIL);
    expect(usernameInput).toHaveValue(VALID_EMAIL);

    await user.type(usernameInput, "{enter}");

    await waitFor(() => expect(mockedRequestPasswordReset).toHaveBeenCalled());
  });

  it("does not send form when enter is pressed and username is invalid", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const usernameInput = screen.getByTestId("forgotPassword-username");
    await user.type(usernameInput, INVALID_EMAIL);
    await user.type(usernameInput, "{enter}");
    expect(usernameInput).toHaveValue(INVALID_EMAIL);
    expect(mockedRequestPasswordReset).not.toHaveBeenCalled();
  });

  it("clears username input on success", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const usernameInput = screen.getByTestId("forgotPassword-username");
    await user.type(usernameInput, VALID_EMAIL);

    await user.type(usernameInput, "{enter}");

    await waitFor(() => expect(usernameInput).toHaveValue(EMPTY_STRING));
  });
});
