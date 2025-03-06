import { Login } from "../Login";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { MessageAction } from "../../../action/ActionType";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router";
import * as Constants from "../../../util/Constants";
import ConfigParam from "../../../util/ConfigParam";
import Message from "../../../model/Message";
import MessageType from "../../../model/MessageType";

jest.mock("../../../util/Routing");

describe("Login", () => {
  let login: (username: string, password: string) => Promise<MessageAction>;

  beforeEach(() => {
    login = jest.fn().mockImplementation(() =>
      Promise.resolve({
        message: new Message(
          { message: "dummy success message" },
          MessageType.SUCCESS
        ),
      })
    );
  });

  it("renders submit button disabled when either field is empty", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    const button = wrapper.find("button#login-submit");
    expect(button.getElement().props.disabled).toBeTruthy();
    const usernameInput = wrapper.find('input[name="username"]');
    const passwordInput = wrapper.find('input[name="password"]');
    (usernameInput.getDOMNode() as HTMLInputElement).value = "aaaa";
    usernameInput.simulate("change", usernameInput);
    expect(button.getElement().props.disabled).toBeTruthy();
    (usernameInput.getDOMNode() as HTMLInputElement).value = "";
    usernameInput.simulate("change", usernameInput);
    (passwordInput.getDOMNode() as HTMLInputElement).value = "aaaa";
    passwordInput.simulate("change", passwordInput);
    expect(button.getElement().props.disabled).toBeTruthy();
  });

  it("enables submit button when both fields are non-empty", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    const button = wrapper.find("button#login-submit");
    expect(button.getElement().props.disabled).toBeTruthy();
    const usernameInput = wrapper.find('input[name="username"]');
    const passwordInput = wrapper.find('input[name="password"]');
    (usernameInput.getDOMNode() as HTMLInputElement).value = "aaaa";
    usernameInput.simulate("change", usernameInput);
    (passwordInput.getDOMNode() as HTMLInputElement).value = "aaaa";
    passwordInput.simulate("change", passwordInput);
    expect(
      wrapper.find("button#login-submit").getElement().props.disabled
    ).toBeFalsy();
  });

  it("invokes login when enter is pressed", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    const usernameInput = wrapper.find('input[name="username"]');
    const passwordInput = wrapper.find('input[name="password"]');
    (usernameInput.getDOMNode() as HTMLInputElement).value = "aaaa";
    usernameInput.simulate("change", usernameInput);
    (passwordInput.getDOMNode() as HTMLInputElement).value = "aaaa";
    passwordInput.simulate("change", passwordInput);
    passwordInput.simulate("keyPress", { key: "Enter" });
    expect(login).toHaveBeenCalled();
  });

  it("does not invoke login when enter is pressed and one field is invalid", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    const usernameInput = wrapper.find('input[name="username"]');
    const passwordInput = wrapper.find('input[name="password"]');
    (usernameInput.getDOMNode() as HTMLInputElement).value = "aaaa";
    usernameInput.simulate("change", usernameInput);
    passwordInput.simulate("keyPress", { key: "Enter" });
    expect(login).not.toHaveBeenCalled();
  });

  it("renders registration link by default", () => {
    jest.spyOn(Constants, "getEnv").mockReturnValue("false");
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    expect(wrapper.exists("#login-register")).toBeTruthy();
  });

  it("does not render registration link when admin registration only is turned on", () => {
    jest.spyOn(Constants, "getEnv").mockImplementation((value: string) => {
      return ConfigParam.ADMIN_REGISTRATION_ONLY === value ? "true" : "false";
    });
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    expect(wrapper.exists("#login-register")).toBeFalsy();
  });

  it("does not render public view link when public view is disabled", () => {
    jest.spyOn(Constants, "getEnv").mockImplementation((value: string) => {
      return ConfigParam.ADMIN_REGISTRATION_ONLY === value ||
        ConfigParam.DISABLE_PUBLIC_VIEW === value
        ? "true"
        : "false";
    });
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <Login loading={false} login={login} {...intlFunctions()} />
      </MemoryRouter>
    );
    expect(wrapper.exists("#login-public-view")).toBeFalsy();
  });
});
