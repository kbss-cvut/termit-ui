import User from "../../../../model/User";
import { Users } from "../Users";
import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";
import Generator from "../../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
import PasswordReset from "../PasswordReset";
import { UserRoleData } from "../../../../model/UserRole";

describe("Users", () => {
  const currentUser = Generator.generateUser();
  const users = [
    Generator.generateUser(),
    Generator.generateUser(),
    currentUser,
  ];

  let loadUsers: () => Promise<User[]>;
  let disableUser: (user: User) => Promise<any>;
  let enableUser: (user: User) => Promise<any>;
  let unlockUser: (user: User, newPass: string) => Promise<any>;
  let changeRole: (user: User, role: UserRoleData) => Promise<any>;

  beforeEach(() => {
    loadUsers = jest.fn().mockImplementation(() => Promise.resolve(users));
    disableUser = jest.fn().mockImplementation(() => Promise.resolve());
    enableUser = jest.fn().mockImplementation(() => Promise.resolve());
    unlockUser = jest.fn().mockImplementation(() => Promise.resolve());
    changeRole = jest.fn().mockResolvedValue({});
  });

  function render() {
    return shallow<Users>(
      <Users
        loadUsers={loadUsers}
        disableUser={disableUser}
        enableUser={enableUser}
        unlockUser={unlockUser}
        currentUser={currentUser}
        changeRole={changeRole}
        {...intlFunctions()}
      />
    );
  }

  it("loads users on mount", async () => {
    render();
    expect(loadUsers).toHaveBeenCalled();
  });

  it("disables user and reloads all users on finish", () => {
    const wrapper = render();

    wrapper.instance().disableUser(users[0]);
    return Promise.resolve().then(() => {
      expect(disableUser).toHaveBeenCalledWith(users[0]);
      expect(loadUsers).toHaveBeenCalledTimes(2);
    });
  });

  it("enables user and reloads all users on finish", () => {
    const wrapper = render();

    wrapper.instance().enableUser(users[0]);
    return Promise.resolve().then(() => {
      expect(enableUser).toHaveBeenCalledWith(users[0]);
      expect(loadUsers).toHaveBeenCalledTimes(2);
    });
  });

  describe("user unlocking", () => {
    it("opens unlock user dialog and passes selected user to it on unlock click", () => {
      const wrapper = render();

      return Promise.resolve().then(() => {
        expect(wrapper.find(PasswordReset).prop("open")).toBeFalsy();
        wrapper.instance().onUnlockUser(users[0]);
        wrapper.update();
        const passwordResetDialog = wrapper.find(PasswordReset);
        expect(passwordResetDialog.prop("open")).toBeTruthy();
        expect(passwordResetDialog.prop("user")).toEqual(users[0]);
      });
    });

    it("closes unlock user dialog on unlock cancel", () => {
      const wrapper = render();

      return Promise.resolve().then(() => {
        wrapper.setState({ userToUnlock: users[0], displayUnlock: true });
        wrapper.update();
        expect(wrapper.find(PasswordReset).prop("open")).toBeTruthy();
        wrapper.instance().onCloseUnlock();
        wrapper.update();
        expect(wrapper.find(PasswordReset).prop("open")).toBeFalsy();
      });
    });

    it("invokes user unlock action on unlock submit", () => {
      const newPassword = "new_password";
      const wrapper = render();

      wrapper.setState({ userToUnlock: users[0], displayUnlock: true });
      wrapper.instance().unlockUser(newPassword);
      return Promise.resolve().then(() => {
        expect(unlockUser).toHaveBeenCalledWith(users[0], newPassword);
      });
    });

    it("closes unlock user dialog when unlock action returns", () => {
      const newPassword = "new_password";
      const wrapper = render();

      wrapper.setState({ userToUnlock: users[0], displayUnlock: true });
      wrapper.instance().unlockUser(newPassword);
      return Promise.resolve().then(() => {
        wrapper.update();
        expect(wrapper.state().displayUnlock).toBeFalsy();
      });
    });

    it("reloads users after unlock action returns", () => {
      const newPassword = "new_password";
      const wrapper = render();

      wrapper.setState({ userToUnlock: users[0], displayUnlock: true });
      wrapper.instance().unlockUser(newPassword);
      return Promise.resolve().then(() => {
        wrapper.update();
        expect(loadUsers).toHaveBeenCalledTimes(2);
      });
    });
  });
});
