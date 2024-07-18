import { AsyncAction, AsyncFailureAction } from "../../../action/ActionType";
import { MemoryRouter } from "react-router";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import MessageType from "../../../model/MessageType";
import { act } from "react-dom/test-utils";
import AsyncActionStatus from "../../../action/AsyncActionStatus";
import { changeInputValue } from "../../../__tests__/environment/TestUtil";
import { ResetPassword } from "../ResetPassword";
import { resetPassword } from "../../../action/AsyncUserActions";

jest.mock("../../../action/AsyncUserActions", () => ({
  ...jest.requireActual("../../../action/AsyncUserActions"),
  resetPassword: jest.fn(),
}));

const mockedResetPassword = jest.mocked(resetPassword, true);

describe("ResetPassword", () => {
  beforeEach(() => {
    mockedResetPassword.mockReset().mockReturnValue(() =>
      Promise.resolve({
        status: AsyncActionStatus.SUCCESS,
        type: MessageType.SUCCESS,
      } as AsyncAction)
    );
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

  it("renders submit button disabled when passwords dont match", () => {
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

    expect(mockedResetPassword).toHaveBeenCalled();
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

    expect(mockedResetPassword).toHaveBeenCalled();
  });

  it("does not send form when enter is pressed and passwords dont match", async () => {
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
    expect(mockedResetPassword).not.toHaveBeenCalled();
  });

  it("disables inputs and button on success request", async () => {
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
    expect(mockedResetPassword).toHaveBeenCalled();
  });

  it("keeps password inputs on failure", async () => {
    mockedResetPassword.mockReturnValue(() =>
      Promise.resolve({
        status: AsyncActionStatus.FAILURE,
        type: MessageType.ERROR,
        error: {
          messageId: "error.message",
        },
      } as AsyncFailureAction)
    );

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

    expect(passwordInput().props().value).toEqual(PASSWORD);
    expect(passwordConfirmationInput().props().value).toEqual(PASSWORD);
    expect(mockedResetPassword).toHaveBeenCalled();
  });
});
