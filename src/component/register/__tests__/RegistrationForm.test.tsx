import * as React from "react";
import ErrorInfo from "../../../model/ErrorInfo";
import ActionType, { AsyncFailureAction } from "../../../action/ActionType";
import { ReactWrapper, shallow } from "enzyme";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { RegistrationForm } from "../RegistrationForm";
import { UserAccountData } from "../../../model/User";
import { Alert, Button } from "reactstrap";
import AsyncActionStatus from "../../../action/AsyncActionStatus";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import Ajax, { params } from "../../../util/Ajax";
import Constants from "../../../util/Constants";
import { MemoryRouter } from "react-router";
import VocabularyUtils from "../../../util/VocabularyUtils";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

describe("RegistrationForm", () => {
  const userInfo = {
    firstName: "a",
    lastName: "b",
    username: "c@example.org",
    password: "d",
  };

  let register: (userData: UserAccountData) => Promise<AsyncFailureAction>;
  let cancel: () => void;

  beforeEach(() => {
    register = jest.fn().mockResolvedValue({});
    cancel = jest.fn();
    Ajax.get = jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: false,
      })
    );
  });

  it("displays submit button disabled when inputs are empty", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <RegistrationForm
          loading={false}
          register={register}
          cancel={cancel}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    const submitButton = wrapper.find(Button).first();
    expect(submitButton.getElement().props.disabled).toBeTruthy();
  });

  it("enables submit button when inputs are nonempty", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <RegistrationForm
          loading={false}
          register={register}
          cancel={cancel}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    fillBasicUserInfo(wrapper);
    fillPasswords(wrapper);
    const submitButton = wrapper.find(Button).first();
    expect(submitButton.getElement().props.disabled).toBeFalsy();
  });

  function fillBasicUserInfo(wrapper: ReactWrapper): void {
    const firstNameInput = wrapper.find('input[name="firstName"]');
    (firstNameInput.getDOMNode() as HTMLInputElement).value =
      userInfo.firstName;
    firstNameInput.simulate("change", firstNameInput);
    const lastNameInput = wrapper.find('input[name="lastName"]');
    (lastNameInput.getDOMNode() as HTMLInputElement).value = userInfo.lastName;
    lastNameInput.simulate("change", lastNameInput);
    const usernameInput = wrapper.find('input[name="username"]');
    (usernameInput.getDOMNode() as HTMLInputElement).value = userInfo.username;
    usernameInput.simulate("change", usernameInput);
  }

  function fillPasswords(
    wrapper: ReactWrapper,
    different: boolean = false
  ): void {
    const passwordInput = wrapper.find('input[name="password"]');
    (passwordInput.getDOMNode() as HTMLInputElement).value = userInfo.password;
    passwordInput.simulate("change", passwordInput);
    const passwordConfirmInput = wrapper.find('input[name="passwordConfirm"]');
    (passwordConfirmInput.getDOMNode() as HTMLInputElement).value = different
      ? "diff"
      : userInfo.password;
    passwordConfirmInput.simulate("change", passwordConfirmInput);
  }

  it("disables submit button when passwords do not match", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <RegistrationForm
          loading={false}
          register={register}
          cancel={cancel}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    fillBasicUserInfo(wrapper);
    fillPasswords(wrapper, true);
    const submitButton = wrapper.find(Button).first();
    expect(submitButton.getElement().props.disabled).toBeTruthy();
  });

  it("submits user for registration on register click", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <RegistrationForm
          loading={false}
          register={register}
          cancel={cancel}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    fillBasicUserInfo(wrapper);
    fillPasswords(wrapper);
    const submitButton = wrapper.find(Button).first();
    submitButton.simulate("click");
    const userWithTypes = Object.assign({}, userInfo, {
      types: [VocabularyUtils.USER_RESTRICTED],
    });
    expect(register).toHaveBeenCalledWith(userWithTypes);
  });

  it("disables submit button when loading", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <RegistrationForm
          loading={true}
          register={register}
          cancel={cancel}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    fillBasicUserInfo(wrapper);
    fillPasswords(wrapper);
    const submitButton = wrapper.find(Button).first();
    expect(submitButton.getElement().props.disabled).toBeTruthy();
  });

  it("checks for username existence on username field edit", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <RegistrationForm
          loading={false}
          register={register}
          cancel={cancel}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    const usernameInput = wrapper.find('input[name="username"]');
    (usernameInput.getDOMNode() as HTMLInputElement).value = userInfo.username;
    usernameInput.simulate("change", usernameInput);
    expect(Ajax.get).toHaveBeenCalledWith(
      Constants.API_PREFIX + "/users/username",
      params({ username: userInfo.username })
    );
  });

  it("clears error on change", () => {
    const error = new ErrorInfo(ActionType.REGISTER, {
      message: "Error",
    });
    const wrapper = shallow<RegistrationForm>(
      <RegistrationForm
        loading={false}
        register={register}
        cancel={cancel}
        {...intlFunctions()}
      />
    );
    wrapper.instance().setState({ error });
    wrapper.update();
    wrapper.instance().onChange({
      currentTarget: {
        name: "firstName",
        value: "a",
      },
    } as React.ChangeEvent<HTMLInputElement>);
    wrapper.update();
    expect(wrapper.instance().state.error).toBeNull();
  });

  it("renders alert with error when register fails", () => {
    const error = new ErrorInfo(ActionType.REGISTER, {
      message: "Error",
    });
    register = jest
      .fn()
      .mockResolvedValue({ status: AsyncActionStatus.FAILURE, error });
    const wrapper = shallow<RegistrationForm>(
      <RegistrationForm
        loading={false}
        register={register}
        cancel={cancel}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onRegister();
    return Promise.resolve().then(() => {
      wrapper.update();
      expect(wrapper.find(Alert).exists()).toBeTruthy();
    });
  });
});
