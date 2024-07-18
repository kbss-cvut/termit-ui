import { AsyncAction } from "../../../action/ActionType";
import { MemoryRouter } from "react-router";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { ForgotPassword } from "../ForgotPassword";
import MessageType from "../../../model/MessageType";
import { act } from "react-dom/test-utils";
import AsyncActionStatus from "../../../action/AsyncActionStatus";
import { changeInputValue } from "../../../__tests__/environment/TestUtil";
import { requestPasswordReset } from "../../../action/AsyncUserActions";

jest.mock("../../../action/AsyncUserActions", () => ({
  ...jest.requireActual("../../../action/AsyncUserActions"),
  requestPasswordReset: jest.fn(),
}));

const mockedRequestPasswordReset = jest.mocked(requestPasswordReset, true);

describe("ForgotPassword", () => {
  const INVALID_EMAIL = "invalid@email";
  const VALID_EMAIL = "valid@kbss.fel.cvut.cz";
  const EMPTY_STRING = "";

  beforeEach(() => {
    mockedRequestPasswordReset.mockReset().mockReturnValue(() =>
      Promise.resolve({
        status: AsyncActionStatus.SUCCESS,
        type: MessageType.SUCCESS,
      } as AsyncAction)
    );
  });

  it("renders submit button disabled when username field is empty", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const button = () => wrapper.find("button#forgotPassword-submit");
    const usernameInput = () => wrapper.find('input[name="username"]');
    expect(usernameInput().props().value).toEqual(EMPTY_STRING);
    expect(button().getElement().props.disabled).toBeTruthy();

    changeInputValue(usernameInput(), VALID_EMAIL);
    expect(usernameInput().props().value).toEqual(VALID_EMAIL);
    changeInputValue(usernameInput(), EMPTY_STRING);
    expect(button().getElement().props.disabled).toBeTruthy();

    changeInputValue(usernameInput(), VALID_EMAIL);
    changeInputValue(usernameInput(), EMPTY_STRING);
    expect(button().getElement().props.disabled).toBeTruthy();
    expect(usernameInput().props().value).toEqual(EMPTY_STRING);
  });

  it("renders submit button disabled when username field is not valid email", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const button = () => wrapper.find("button#forgotPassword-submit");
    const usernameInput = () => wrapper.find('input[name="username"]');
    expect(usernameInput().props().value).toEqual("");
    expect(button().props().disabled).toBeTruthy();

    changeInputValue(usernameInput(), VALID_EMAIL);
    expect(button().props().disabled).toBeFalsy();

    changeInputValue(usernameInput(), INVALID_EMAIL);
    expect(button().getElement().props.disabled).toBeTruthy();

    changeInputValue(usernameInput(), VALID_EMAIL);
    expect(button().getElement().props.disabled).toBeFalsy();
    expect(usernameInput().props().value).toEqual(VALID_EMAIL);
  });

  it("does send form when button is pressed and username is valid", async () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const button = () => wrapper.find("button#forgotPassword-submit");
    const usernameInput = () => wrapper.find('input[name="username"]');

    changeInputValue(usernameInput(), VALID_EMAIL);

    expect(usernameInput().props().value).toEqual(VALID_EMAIL);

    await act(async () => {
      button().simulate("click");
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(mockedRequestPasswordReset).toHaveBeenCalled();
  });

  it("does send form when enter is pressed and username is valid", async () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const usernameInput = () => wrapper.find('input[name="username"]');

    changeInputValue(usernameInput(), VALID_EMAIL);

    expect(usernameInput().props().value).toEqual(VALID_EMAIL);

    await act(async () => {
      usernameInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(requestPasswordReset).toHaveBeenCalled();
  });

  it("does not send form when enter is pressed and username is invalid", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    mockedRequestPasswordReset.mockReturnValue(() =>
      Promise.resolve({} as AsyncAction)
    );
    const usernameInput = () => wrapper.find('input[name="username"]');
    changeInputValue(usernameInput(), INVALID_EMAIL);
    usernameInput().simulate("keyPress", { key: "Enter" });
    expect(usernameInput().props().value).toEqual(INVALID_EMAIL);
    expect(mockedRequestPasswordReset).not.toHaveBeenCalled();
  });

  it("clears username input on success", async () => {
    const requestResult: AsyncAction = {
      status: AsyncActionStatus.SUCCESS,
      type: MessageType.SUCCESS,
    };
    mockedRequestPasswordReset.mockReturnValue(() =>
      Promise.resolve(requestResult)
    );
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const usernameInput = () => wrapper.find('input[name="username"]');
    changeInputValue(usernameInput(), VALID_EMAIL);

    // required to wait on .then execution on requestPasswordReset
    // and to let component handle its state
    await act(async () => {
      usernameInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(usernameInput().props().value).toEqual(EMPTY_STRING);
  });
});
