import { ProfileActionButtons } from "../ProfileActionButtons";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { fireEvent, screen } from "@testing-library/react";
import { i18n } from "../../../__tests__/environment/IntlUtil";

describe("ProfileActionButtons", () => {
  let showProfileEdit: () => void;
  let navigateToChangePasswordRoute: () => void;
  let edit: boolean;

  beforeEach(() => {
    showProfileEdit = vi.fn();
    navigateToChangePasswordRoute = vi.fn();
    edit = false;
  });

  it("correctly renders component if !edit", () => {
    renderWithIntl(
      <ProfileActionButtons
        edit={edit}
        showProfileEdit={showProfileEdit}
        navigateToChangePasswordRoute={navigateToChangePasswordRoute}
      />
    );

    // expect(buttonToolbar.length).toEqual(1);
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: i18n("edit") })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: i18n("profile.change-password") })
    ).toBeInTheDocument();
  });

  it("correctly renders component if edit", () => {
    renderWithIntl(
      <ProfileActionButtons
        edit={true}
        showProfileEdit={showProfileEdit}
        navigateToChangePasswordRoute={navigateToChangePasswordRoute}
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls navigateToChangePassword route on change password button click", () => {
    renderWithIntl(
      <ProfileActionButtons
        edit={edit}
        showProfileEdit={showProfileEdit}
        navigateToChangePasswordRoute={navigateToChangePasswordRoute}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: i18n("profile.change-password") })
    );
    expect(navigateToChangePasswordRoute).toHaveBeenCalled();
  });

  it("calls showProfileEdit route on edit profile button click", () => {
    renderWithIntl(
      <ProfileActionButtons
        edit={edit}
        showProfileEdit={showProfileEdit}
        navigateToChangePasswordRoute={navigateToChangePasswordRoute}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: i18n("edit") }));
    expect(showProfileEdit).toHaveBeenCalled();
  });
});
