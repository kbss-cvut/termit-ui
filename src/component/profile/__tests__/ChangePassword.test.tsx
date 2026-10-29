import { renderWithIntl } from "../../../__tests__/environment/Environment";
import User from "../../../model/User";
import { AsyncAction } from "../../../action/ActionType";
import Generator from "../../../__tests__/environment/Generator";
import { i18n, intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { ChangePassword } from "../ChangePassword";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import { fireEvent, screen } from "@testing-library/react";

vi.mock("../../../util/Routing");

describe("ChangePassword", () => {
  let user: User;
  let changePassword: (user: User) => Promise<AsyncAction>;

  beforeEach(() => {
    changePassword = vi.fn().mockImplementation(() => Promise.resolve({}));
    user = Generator.generateUser();
  });

  function renderForm() {
    return renderWithIntl(
      <ChangePassword
        changePassword={changePassword}
        user={user}
        {...intlFunctions()}
      />
    );
  }

  function passwordInput(name: string): HTMLInputElement {
    return document.querySelector(`input[name="${name}"]`)!;
  }

  it("correctly renders component", () => {
    renderForm();
    expect(
      screen.getByText(i18n("profile.change-password"))
    ).toBeInTheDocument();
    expect(passwordInput("currentPassword")).toHaveValue("");
    expect(passwordInput("newPassword")).toHaveValue("");
    expect(passwordInput("confirmPassword")).toHaveValue("");
    expect(
      screen.getByRole("button", { name: i18n("save") })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: i18n("cancel") })
    ).toBeInTheDocument();
  });

  it("navigates to profile route on cancel", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: i18n("cancel") }));
    expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.profile);
  });

  it("renders disabled submit button if all fields are empty", () => {
    renderForm();
    const button = screen.getByRole("button", { name: i18n("save") });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(changePassword).not.toHaveBeenCalled();
  });

  function fillPasswords(different = false): void {
    fireEvent.change(passwordInput("currentPassword"), {
      target: { value: "current" },
    });
    fireEvent.change(passwordInput("newPassword"), {
      target: { value: "new123Password" },
    });
    fireEvent.change(passwordInput("confirmPassword"), {
      target: { value: different ? "diff" : "new123Password" },
    });
  }

  it("disables submit button when passwords do not match", () => {
    renderForm();
    fillPasswords(true);
    expect(screen.getByRole("button", { name: i18n("save") })).toBeDisabled();
  });

  it("calls changePassword function on submit button click if every field is filled correctly", () => {
    renderForm();
    fillPasswords();
    const button = screen.getByRole("button", { name: i18n("save") });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(changePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        originalPassword: "current",
        password: "new123Password",
      })
    );
  });
});
