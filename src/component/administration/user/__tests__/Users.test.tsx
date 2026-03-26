import Users from "../Users";
import Generator from "../../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
import PasswordReset from "../PasswordReset";
import * as UserActions from "../../../../action/AsyncUserActions";
import UsersTable from "../UsersTable";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import * as Redux from "react-redux";
import * as OidcUtils from "../../../../util/OidcUtils";
import * as Constats from "../../../../util/Constants";

vi.mock("react-redux", async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        useSelector: vi.fn(),
        useDispatch: vi.fn(),
    };
});

describe("Users", () => {
  const currentUser = Generator.generateUser();
  const users = [
    Generator.generateUser(),
    Generator.generateUser(),
    currentUser,
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi
      .spyOn(Redux, "useDispatch")
      .mockReturnValue(vi.fn().mockResolvedValue({}));
  });

  function render() {
    vi
      .spyOn(Redux, "useSelector")
      .mockReturnValueOnce(users)
      .mockReturnValueOnce(currentUser);
    mockUseI18n();
    return shallow(<Users />);
  }

  it("disables user and reloads all users on finish", () => {
    vi.spyOn(UserActions, "loadUsers");
    vi.spyOn(UserActions, "disableUser");
    const wrapper = render();

    wrapper.find(UsersTable).prop("disable")(users[0]);
    return Promise.resolve().then(() => {
      expect(UserActions.disableUser).toHaveBeenCalledWith(users[0]);
      expect(UserActions.loadUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("enables user and reloads all users on finish", () => {
    vi.spyOn(UserActions, "loadUsers");
    vi.spyOn(UserActions, "enableUser");
    const wrapper = render();

    wrapper.find(UsersTable).prop("enable")(users[0]);
    return Promise.resolve().then(() => {
      expect(UserActions.enableUser).toHaveBeenCalledWith(users[0]);
      expect(UserActions.loadUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("renders users table read only when using OIDC authentication", () => {
    vi.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    vi.spyOn(UserActions, "loadUsers");
    const wrapper = render();
    expect(wrapper.find(UsersTable).prop("readOnly")).toBeTruthy();
  });

  it("renders link to auth service administration when using OIDC authentication", () => {
    const link = "http://localhost/services/auth";
    vi.spyOn(Constats, "getEnv").mockReturnValue(link);
    vi.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    vi.spyOn(UserActions, "loadUsers");
    const wrapper = render();
    expect(wrapper.exists("#oidc-notice")).toBeTruthy();
  });

  describe("user unlocking", () => {
    it("opens unlock user dialog and passes selected user to it on unlock click", () => {
      const wrapper = render();

      return Promise.resolve().then(() => {
        expect(wrapper.find(PasswordReset).prop("open")).toBeFalsy();
        wrapper.find(UsersTable).prop("unlock")(users[0]);
        wrapper.update();
        const passwordResetDialog = wrapper.find(PasswordReset);
        expect(passwordResetDialog.prop("open")).toBeTruthy();
        expect(passwordResetDialog.prop("user")).toEqual(users[0]);
      });
    });

    it("closes unlock user dialog on unlock cancel", () => {
      const wrapper = render();

      return Promise.resolve().then(() => {
        wrapper.find(UsersTable).prop("unlock")(users[0]);
        wrapper.update();
        expect(wrapper.find(PasswordReset).prop("open")).toBeTruthy();
        wrapper.find(PasswordReset).prop("onCancel")();
        wrapper.update();
        expect(wrapper.find(PasswordReset).prop("open")).toBeFalsy();
      });
    });

    it("invokes user unlock action on unlock submit", () => {
      vi.spyOn(UserActions, "unlockUser");
      const newPassword = "new_password";
      const wrapper = render();

      wrapper.find(UsersTable).prop("unlock")(users[0]);
      wrapper.update();
      wrapper.find(PasswordReset).prop("onSubmit")(newPassword);
      return Promise.resolve().then(() => {
        expect(UserActions.unlockUser).toHaveBeenCalledWith(
          users[0],
          newPassword
        );
      });
    });

    it("closes unlock user dialog when unlock action returns", () => {
      vi.spyOn(UserActions, "unlockUser");
      const newPassword = "new_password";
      const wrapper = render();

      wrapper.find(UsersTable).prop("unlock")(users[0]);
      wrapper.update();
      wrapper.find(PasswordReset).prop("onSubmit")(newPassword);
      return Promise.resolve().then(() => {
        wrapper.update();
        expect(wrapper.find(PasswordReset).prop("open")).toBeFalsy();
      });
    });

    it("reloads users after unlock action returns", () => {
      vi.spyOn(UserActions, "unlockUser");
      vi.spyOn(UserActions, "loadUsers");
      const newPassword = "new_password";
      const wrapper = render();

      wrapper.find(UsersTable).prop("unlock")(users[0]);
      wrapper.update();
      wrapper.find(PasswordReset).prop("onSubmit")(newPassword);
      return Promise.resolve().then(() => {
        expect(UserActions.loadUsers).toHaveBeenCalled();
      });
    });
  });
});
