import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Users from "../Users";
import Generator from "../../../../__tests__/environment/Generator";
import * as UserActions from "../../../../action/AsyncUserActions";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import * as Redux from "react-redux";
import * as OidcUtils from "../../../../util/OidcUtils";
import * as Constats from "../../../../util/Constants";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

// UsersTable pulls in @tanstack/react-table and renders a full data table. It is stubbed out
// here so these tests can focus on Users' own wiring of the disable/enable/readOnly props,
// without needing to also satisfy UsersTable's own useSelector calls.
vi.mock("../UsersTable", () => ({
  default: (props: any) => (
    <div data-testid="users-table" data-readonly={String(!!props.readOnly)}>
      <button
        data-testid="disable-first-user"
        onClick={() => props.disable(props.users[0])}
      >
        disable
      </button>
      <button
        data-testid="enable-first-user"
        onClick={() => props.enable(props.users[0])}
      >
        enable
      </button>
    </div>
  ),
}));

describe("Users", () => {
  const currentUser = Generator.generateUser();
  const users = [
    Generator.generateUser(),
    Generator.generateUser(),
    currentUser,
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(Redux, "useDispatch").mockReturnValue(
      vi.fn().mockResolvedValue({})
    );
  });

  function renderUsers() {
    vi.spyOn(Redux, "useSelector")
      .mockReturnValueOnce(users)
      .mockReturnValueOnce(currentUser);
    mockUseI18n();
    return render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
  }

  it("disables user and reloads all users on finish", async () => {
    vi.spyOn(UserActions, "loadUsers");
    vi.spyOn(UserActions, "disableUser");
    const ue = userEvent.setup();
    renderUsers();

    await ue.click(screen.getByTestId("disable-first-user"));
    await waitFor(() => {
      expect(UserActions.disableUser).toHaveBeenCalledWith(users[0]);
      expect(UserActions.loadUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("enables user and reloads all users on finish", async () => {
    vi.spyOn(UserActions, "loadUsers");
    vi.spyOn(UserActions, "enableUser");
    const ue = userEvent.setup();
    renderUsers();

    await ue.click(screen.getByTestId("enable-first-user"));
    await waitFor(() => {
      expect(UserActions.enableUser).toHaveBeenCalledWith(users[0]);
      expect(UserActions.loadUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("renders users table read only when using OIDC authentication", () => {
    vi.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    vi.spyOn(UserActions, "loadUsers");
    renderUsers();
    expect(screen.getByTestId("users-table")).toHaveAttribute(
      "data-readonly",
      "true"
    );
  });

  it("renders link to auth service administration when using OIDC authentication", () => {
    const link = "http://localhost/services/auth";
    vi.spyOn(Constats, "getEnv").mockReturnValue(link);
    vi.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    vi.spyOn(UserActions, "loadUsers");
    const { container } = renderUsers();
    expect(container.querySelector("#oidc-notice")).toBeTruthy();
  });
});
