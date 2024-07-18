import { AsyncAction, AsyncFailureAction } from "../../../action/ActionType";
import { MemoryRouter } from "react-router";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { i18n } from "../../../__tests__/environment/IntlUtil";
import MessageType from "../../../model/MessageType";
import { Alert } from "reactstrap";
import { act } from "react-dom/test-utils";
import AsyncActionStatus from "../../../action/AsyncActionStatus";
import ErrorInfo from "../../../model/ErrorInfo";
import { changeInputValue } from "../../../__tests__/environment/TestUtil";
import ChangePasswordDto from "../../../model/ChangePasswordDto";
import { ResetPassword } from "../ResetPassword";

describe("ResetPassword", () => {
  let resetPassword: (
    data: ChangePasswordDto
  ) => Promise<AsyncFailureAction | AsyncAction>;

  beforeEach(() => {
    resetPassword = jest.fn().mockImplementation(() => Promise.resolve({}));
  });

  const PASSWORD = "UltraSecretPassword";
  const INVALID_PASSWORD_CONFIRMATION = "NotSoSecretPassword";
  const EMPTY_STRING = "";

  it("renders submit button disabled when any field is empty", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );
    const button = () => wrapper.find("button#resetPassword-submit");
    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');
    const isAnyEmpty = () =>
      passwordInput().props().value == EMPTY_STRING ||
      passwordConfirmationInput().props().value == EMPTY_STRING;
    expect(isAnyEmpty()).toBeTruthy();
    expect(passwordInput().props().value == EMPTY_STRING);
    expect(passwordConfirmationInput().props().value == EMPTY_STRING);
    expect(button().props().disabled).toBeTruthy();

    changeInputValue(passwordInput(), PASSWORD);
    expect(isAnyEmpty()).toBeTruthy();
    changeInputValue(passwordConfirmationInput(), PASSWORD);
    expect(isAnyEmpty()).toBeFalsy();
    expect(button().props().disabled).toBeFalsy();
  });

  it("renders submit button disabled when passwords does not match", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );
    const button = () => wrapper.find("button#resetPassword-submit");
    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    expect(button().props().disabled).toBeTruthy();

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(passwordConfirmationInput(), PASSWORD);
    changeInputValue(
      passwordConfirmationInput(),
      INVALID_PASSWORD_CONFIRMATION
    );
    expect(button().props().disabled).toBeTruthy();

    changeInputValue(passwordConfirmationInput(), PASSWORD);
    changeInputValue(passwordInput(), INVALID_PASSWORD_CONFIRMATION);
    expect(button().props().disabled).toBeTruthy();
  });

  it("renders submit button enabled when passwords match", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );
    const button = () => wrapper.find("button#resetPassword-submit");
    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(passwordConfirmationInput(), PASSWORD);
    expect(button().props().disabled).toBeFalsy();

    changeInputValue(
      passwordConfirmationInput(),
      INVALID_PASSWORD_CONFIRMATION
    );
    changeInputValue(passwordInput(), INVALID_PASSWORD_CONFIRMATION);
    expect(button().props().disabled).toBeFalsy();
  });

  it("does send form when button is pressed and passwords match", async () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );
    const button = () => wrapper.find("button#resetPassword-submit");
    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(passwordConfirmationInput(), PASSWORD);

    expect(passwordInput().props().value).toEqual(PASSWORD);

    await act(async () => {
      button().simulate("click");
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(resetPassword).toHaveBeenCalled();
  });

  it("does send form when enter is pressed and passwords match", async () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(passwordConfirmationInput(), PASSWORD);

    expect(passwordInput().props().value).toEqual(PASSWORD);

    await act(async () => {
      passwordInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(resetPassword).toHaveBeenCalled();
  });

  it("does send form when enter is pressed and passwords match", async () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(
      passwordConfirmationInput(),
      INVALID_PASSWORD_CONFIRMATION
    );

    await act(async () => {
      passwordInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(passwordInput().props().value).toEqual(PASSWORD);
    expect(resetPassword).not.toHaveBeenCalled();
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
    resetPassword = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const alert = () => wrapper.find(Alert);
    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(passwordConfirmationInput(), PASSWORD);

    await act(async () => {
      passwordConfirmationInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(alert().props().color).toEqual(requestResult.type);
    expect(alert().text()).toEqual(requestResult.error.message);
  });

  it("renders alert with internationalized messageId", async () => {
    const requestResult: AsyncFailureAction = {
      error: new ErrorInfo(MessageType.ERROR, {
        messageId: "resetPassword.invalidToken",
        message: "Error message text",
      }),
      status: AsyncActionStatus.FAILURE,
      type: MessageType.ERROR,
    };
    resetPassword = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const alert = () => wrapper.find(Alert);
    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(passwordConfirmationInput(), PASSWORD);

    await act(async () => {
      passwordConfirmationInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(alert().props().color).toEqual(requestResult.type);
    expect(alert().text()).toEqual(i18n("resetPassword.invalidToken"));
  });

  it("renders alert on success", async () => {
    const requestResult: AsyncAction = {
      status: AsyncActionStatus.SUCCESS,
      type: MessageType.SUCCESS,
    };
    resetPassword = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const alert = () => wrapper.find(Alert);
    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(passwordConfirmationInput(), PASSWORD);

    await act(async () => {
      passwordConfirmationInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(alert().props().color).toEqual(requestResult.type);
    expect(alert().text()).toEqual(i18n("resetPassword.success"));
  });

  it("disables inputs and button on success request", async () => {
    const requestResult: AsyncAction = {
      status: AsyncActionStatus.SUCCESS,
      type: MessageType.SUCCESS,
    };
    resetPassword = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const button = () => wrapper.find("button#resetPassword-submit");
    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(passwordConfirmationInput(), PASSWORD);

    await act(async () => {
      passwordConfirmationInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(button().props().disabled).toBeTruthy();
    expect(passwordInput().props().disabled).toBeTruthy();
    expect(passwordConfirmationInput().props().disabled).toBeTruthy();
  });

  it("clears password inputs on success", async () => {
    const requestResult: AsyncAction = {
      status: AsyncActionStatus.SUCCESS,
      type: MessageType.SUCCESS,
    };
    resetPassword = jest
      .fn()
      .mockImplementation(() => Promise.resolve(requestResult));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const passwordInput = () => wrapper.find('input[name="newPassword"]');
    const passwordConfirmationInput = () =>
      wrapper.find('input[name="newPassword-confirm"]');

    changeInputValue(passwordInput(), PASSWORD);
    changeInputValue(passwordConfirmationInput(), PASSWORD);

    await act(async () => {
      passwordConfirmationInput().simulate("keyPress", { key: "Enter" });
      await new Promise(process.nextTick);
      wrapper.update();
    });

    expect(passwordInput().props().value).toEqual(EMPTY_STRING);
    expect(passwordConfirmationInput().props().value).toEqual(EMPTY_STRING);
  });
});
