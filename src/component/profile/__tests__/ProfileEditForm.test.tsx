import * as React from "react";

import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { ProfileEditForm } from "../ProfileEditForm";
import { i18n } from "../../../__tests__/environment/IntlUtil";
import { fireEvent, screen } from "@testing-library/react";

describe("ProfileEditForm", () => {
  let firstName: string;
  let lastName: string;
  let username: string;
  let onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  let onSubmit: () => void;
  let onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  let showProfileView: () => void;
  let isValid: boolean;

  beforeEach(() => {
    firstName = "FirstName";
    lastName = "LastName";
    username = "username";
    onChange = vi.fn();
    onSubmit = vi.fn();
    onKeyPress = vi.fn();
    showProfileView = vi.fn();
    isValid = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderForm(valid = isValid) {
    return renderWithIntl(
      <ProfileEditForm
        firstName={firstName}
        lastName={lastName}
        username={username}
        onChange={onChange}
        onSubmit={onSubmit}
        onKeyPress={onKeyPress}
        showProfileView={showProfileView}
        isValid={valid}
      />
    );
  }

  it("correctly renders component with firstName and lastName set", () => {
    renderForm();
    expect(screen.getByDisplayValue(firstName)).toHaveValue(firstName);
    expect(screen.getByDisplayValue(lastName)).toHaveValue(lastName);
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: i18n("save") })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: i18n("cancel") })
    ).toBeInTheDocument();
  });

  it("calls onSubmit function on save button click if isValid", () => {
    renderForm();
    const button = screen.getByRole("button", { name: i18n("save") });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("renders disabled submit button if !isValid", () => {
    renderForm(false);
    const button = screen.getByRole("button", { name: i18n("save") });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls showProfileView on cancel button click", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: i18n("cancel") }));
    expect(showProfileView).toHaveBeenCalled();
  });

  it("invokes onKeyPress function when enter is pressed", () => {
    renderForm();
    fireEvent.keyPress(screen.getByDisplayValue(lastName), {
      key: "Enter",
      charCode: 13,
    });
    expect(onKeyPress).toHaveBeenCalled();
  });
});
