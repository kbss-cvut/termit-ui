import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorInfo from "../../../model/ErrorInfo";
import ActionType, { AsyncFailureAction } from "../../../action/ActionType";
import { RegistrationForm } from "../RegistrationForm";
import { UserAccountData } from "../../../model/User";
import AsyncActionStatus from "../../../action/AsyncActionStatus";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import Ajax, { params } from "../../../util/Ajax";
import Constants from "../../../util/Constants";
import { MemoryRouter } from "react-router";
import VocabularyUtils from "../../../util/VocabularyUtils";

describe("RegistrationForm", () => {
  const userInfo = {
    firstName: "a",
    lastName: "b",
    username: "c@example.org",
    password: "ABCDefgh12345",
  };

  let register: (userData: UserAccountData) => Promise<AsyncFailureAction>;
  let cancel: () => void;

  beforeEach(() => {
    register = vi.fn().mockResolvedValue({});
    cancel = vi.fn();
    Ajax.get = vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: false,
      })
    );
  });

  function renderForm(loading: boolean = false) {
    renderWithIntl(
      <MemoryRouter>
        <RegistrationForm
          loading={loading}
          register={register}
          cancel={cancel}
        />
      </MemoryRouter>
    );
  }

  async function fillBasicUserInfo(): Promise<void> {
    const user = userEvent.setup();
    await user.type(
      screen.getByTestId("register-first-name"),
      userInfo.firstName
    );
    await user.type(
      screen.getByTestId("register-last-name"),
      userInfo.lastName
    );
    await user.type(screen.getByTestId("register-username"), userInfo.username);
  }

  async function fillPasswords(different: boolean = false): Promise<void> {
    const user = userEvent.setup();
    await user.type(screen.getByTestId("register-password"), userInfo.password);
    await user.type(
      screen.getByTestId("register-password-confirm"),
      different ? "diff" : userInfo.password
    );
  }

  it("displays submit button disabled when inputs are empty", () => {
    renderForm();
    expect(screen.getByTestId("register-submit")).toBeDisabled();
  });

  it("enables submit button when inputs are nonempty", async () => {
    renderForm();
    await fillBasicUserInfo();
    await fillPasswords();
    await waitFor(() =>
      expect(screen.getByTestId("register-submit")).not.toBeDisabled()
    );
  });

  it("disables submit button when passwords do not match", async () => {
    renderForm();
    await fillBasicUserInfo();
    await fillPasswords(true);
    expect(screen.getByTestId("register-submit")).toBeDisabled();
  });

  it("submits user for registration on register click", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillBasicUserInfo();
    await fillPasswords();
    await waitFor(() =>
      expect(screen.getByTestId("register-submit")).not.toBeDisabled()
    );
    await user.click(screen.getByTestId("register-submit"));
    const userWithTypes = Object.assign({}, userInfo, {
      types: [VocabularyUtils.USER_RESTRICTED],
    });
    expect(register).toHaveBeenCalledWith(userWithTypes);
  });

  it("disables submit button when loading", async () => {
    renderForm(true);
    await fillBasicUserInfo();
    await fillPasswords();
    expect(screen.getByTestId("register-submit")).toBeDisabled();
  });

  it("checks for username existence on username field edit", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByTestId("register-username"), userInfo.username);
    await waitFor(() =>
      expect(Ajax.get).toHaveBeenCalledWith(
        Constants.API_PREFIX + "/users/username",
        params({ username: userInfo.username })
      )
    );
  });

  it("clears error on change", async () => {
    const error = new ErrorInfo(ActionType.REGISTER, {
      message: "Error",
    });
    register = vi
      .fn()
      .mockResolvedValue({ status: AsyncActionStatus.FAILURE, error });
    const user = userEvent.setup();
    renderForm();
    await fillBasicUserInfo();
    await fillPasswords();
    await user.click(screen.getByTestId("register-submit"));
    await waitFor(() =>
      expect(screen.getByTestId("register-error")).toBeInTheDocument()
    );
    await user.type(screen.getByTestId("register-first-name"), "x");
    await waitFor(() =>
      expect(screen.queryByTestId("register-error")).not.toBeInTheDocument()
    );
  });

  it("renders alert with error when register fails", async () => {
    const error = new ErrorInfo(ActionType.REGISTER, {
      message: "Error",
    });
    register = vi
      .fn()
      .mockResolvedValue({ status: AsyncActionStatus.FAILURE, error });
    const user = userEvent.setup();
    renderForm();
    await fillBasicUserInfo();
    await fillPasswords();
    await user.click(screen.getByTestId("register-submit"));
    await waitFor(() =>
      expect(screen.getByTestId("register-error")).toBeInTheDocument()
    );
  });
});
