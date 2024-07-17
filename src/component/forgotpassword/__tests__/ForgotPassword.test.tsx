import { AsyncAction, AsyncFailureAction } from "../../../action/ActionType";
import { MemoryRouter } from "react-router";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { ForgotPassword } from "../ForgotPassword";
import { i18n, intlFunctions } from "../../../__tests__/environment/IntlUtil";
import MessageType from "../../../model/MessageType";
import { Alert } from "reactstrap";
import { act } from "react-dom/test-utils";
import AsyncActionStatus from "../../../action/AsyncActionStatus";
import ErrorInfo from "../../../model/ErrorInfo";
import { changeInputValue } from "../../../__tests__/environment/TestUtil";

describe("ForgotPassword", () => {
  let requestPasswordReset: (
    username: string
  ) => Promise<AsyncFailureAction | AsyncAction>;

  beforeEach(() => {
    requestPasswordReset = jest
      .fn()
      .mockImplementation(() => Promise.resolve({}));
  });

  const INVALID_EMAIL = "invalid@email";
  const VALID_EMAIL = "valid@kbss.fel.cvut.cz";
  const EMPTY_STRING = "";

  it("renders submit button disabled when username field is empty", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
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
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
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
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
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

    expect(requestPasswordReset).toHaveBeenCalled();
  });

  it("does send form when enter is pressed and username is valid", async () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
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
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    const usernameInput = () => wrapper.find('input[name="username"]');
    changeInputValue(usernameInput(), INVALID_EMAIL);
    usernameInput().simulate("keyPress", { key: "Enter" });
    expect(usernameInput().props().value).toEqual(INVALID_EMAIL);
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it("renders alert with message", async () => {
    const requestResult = {
      error: {
        messageId: undefined,
        message: "Error message text",
      },
      status: AsyncActionStatus.FAILURE,
      type: MessageType.ERROR,
    } as AsyncFailureAction;
    requestPasswordReset = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );

    const usernameInput = () => wrapper.find('input[name="username"]');
    const alert = () => wrapper.find(Alert);
    changeInputValue(usernameInput(), VALID_EMAIL);

    // required to wait on .then execution on requestPasswordReset
    // and to let component handle its state
    await act(async () => {
      usernameInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(alert().props().color).toEqual(requestResult.type);
    expect(alert().text()).toEqual(requestResult.error.message);
  });

  it("renders alert with internationalized messageId", async () => {
    const requestResult: AsyncFailureAction = {
      error: new ErrorInfo(MessageType.ERROR, {
        messageId: "forgotPassword.username.notValidEmail",
        message: "Error message text",
      }),
      status: AsyncActionStatus.FAILURE,
      type: MessageType.ERROR,
    };
    requestPasswordReset = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );

    const usernameInput = () => wrapper.find('input[name="username"]');
    const alert = () => wrapper.find(Alert);
    changeInputValue(usernameInput(), VALID_EMAIL);

    // required to wait on .then execution on requestPasswordReset
    // and to let component handle its state
    await act(async () => {
      usernameInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(alert().props().color).toEqual(requestResult.type);
    expect(alert().text()).toEqual(
      i18n("forgotPassword.username.notValidEmail")
    );
  });

  it("renders alert on success", async () => {
    const requestResult: AsyncAction = {
      status: AsyncActionStatus.SUCCESS,
      type: MessageType.SUCCESS,
    };
    requestPasswordReset = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );

    const usernameInput = () => wrapper.find('input[name="username"]');
    const alert = () => wrapper.find(Alert);
    changeInputValue(usernameInput(), VALID_EMAIL);

    // required to wait on .then execution on requestPasswordReset
    // and to let component handle its state
    await act(async () => {
      usernameInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(alert().props().color).toEqual(requestResult.type);
    expect(alert().text()).toEqual(i18n("forgotPassword.success"));
  });

  it("renders alert on success", async () => {
    const requestResult: AsyncAction = {
      status: AsyncActionStatus.SUCCESS,
      type: MessageType.SUCCESS,
    };
    requestPasswordReset = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );

    const usernameInput = () => wrapper.find('input[name="username"]');
    const alert = () => wrapper.find(Alert);
    changeInputValue(usernameInput(), VALID_EMAIL);

    // required to wait on .then execution on requestPasswordReset
    // and to let component handle its state
    await act(async () => {
      usernameInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(alert().props().color).toEqual(requestResult.type);
    expect(alert().text()).toEqual(i18n("forgotPassword.success"));
  });

  it("clears username input on success", async () => {
    const requestResult: AsyncAction = {
      status: AsyncActionStatus.SUCCESS,
      type: MessageType.SUCCESS,
    };
    requestPasswordReset = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ForgotPassword
          loading={false}
          requestPasswordReset={requestPasswordReset}
          {...intlFunctions()}
        />
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
