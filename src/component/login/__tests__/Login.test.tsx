import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "../Login";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { MessageAction } from "../../../action/ActionType";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router";
import * as Constants from "../../../util/Constants";
import ConfigParam from "../../../util/ConfigParam";
import Message from "../../../model/Message";
import MessageType from "../../../model/MessageType";

vi.mock("../../../util/Routing");

describe("Login", () => {
  let login: (username: string, password: string) => Promise<MessageAction>;

  beforeEach(() => {
    login = vi.fn().mockImplementation(() =>
      Promise.resolve({
        message: new Message(
          { message: "dummy success message" },
          MessageType.SUCCESS
        ),
      })
    );
  });

  it("renders submit button disabled when either field is empty", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    const button = screen.getByTestId("login-submit");
    expect(button).toBeDisabled();
    const usernameInput = screen.getByTestId("login-username");
    const passwordInput = screen.getByTestId("login-password");
    await user.type(usernameInput, "aaaa");
    expect(button).toBeDisabled();
    await user.clear(usernameInput);
    await user.type(passwordInput, "aaaa");
    expect(button).toBeDisabled();
  });

  it("enables submit button when both fields are non-empty", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    const button = screen.getByTestId("login-submit");
    expect(button).toBeDisabled();
    await user.type(screen.getByTestId("login-username"), "aaaa");
    await user.type(screen.getByTestId("login-password"), "aaaa");
    expect(button).not.toBeDisabled();
  });

  it("invokes login when enter is pressed", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    await user.type(screen.getByTestId("login-username"), "aaaa");
    await user.type(screen.getByTestId("login-password"), "aaaa{enter}");
    expect(login).toHaveBeenCalled();
  });

  it("does not invoke login when enter is pressed and one field is invalid", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    await user.type(screen.getByTestId("login-username"), "aaaa");
    await user.type(screen.getByTestId("login-password"), "{enter}");
    expect(login).not.toHaveBeenCalled();
  });

  it("renders registration link by default", () => {
    vi.spyOn(Constants, "getEnv").mockReturnValue("false");
    renderWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    expect(screen.queryByTestId("login-register")).toBeInTheDocument();
  });

  it("does not render registration link when admin registration only is turned on", () => {
    vi.spyOn(Constants, "getEnv").mockImplementation((value: string) => {
      return ConfigParam.ADMIN_REGISTRATION_ONLY === value ? "true" : "false";
    });
    renderWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    expect(screen.queryByTestId("login-register")).not.toBeInTheDocument();
  });

  it("does not render public view link when public view is disabled", () => {
    vi.spyOn(Constants, "getEnv").mockImplementation((value: string) => {
      return ConfigParam.ADMIN_REGISTRATION_ONLY === value ||
        ConfigParam.DISABLE_PUBLIC_VIEW === value
        ? "true"
        : "false";
    });
    renderWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    expect(screen.queryByTestId("login-public-view")).not.toBeInTheDocument();
  });
});
