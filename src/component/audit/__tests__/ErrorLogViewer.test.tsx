import * as Redux from "react-redux";
import ErrorInfo, { ErrorLogItem } from "../../../model/ErrorInfo";
import ActionType from "../../../action/ActionType";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import ErrorLogViewer from "../ErrorLogViewer";
import en from "../../../i18n/en";
import * as SyncActions from "../../../action/SyncActions";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mock, vi } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe("ErrorLogViewer", () => {
  it("displays error items with timestamps", () => {
    const errors: ErrorLogItem[] = [
      {
        timestamp: Date.now() - 1000,
        error: new ErrorInfo(ActionType.FETCH_USER, {
          message: "Fetch user error",
        }),
      },
      {
        timestamp: Date.now(),
        error: new ErrorInfo(ActionType.LOGIN, { message: "Login error" }),
      },
    ];
    (Redux.useSelector as Mock).mockReturnValue(errors);
    renderWithIntl(<ErrorLogViewer />);
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(errors.length + 1); // + header
    const timestamps = document.querySelectorAll(".error-log-timestamp");
    expect(timestamps).toHaveLength(errors.length);
    expect(timestamps[0].textContent).toContain(
      new Date(errors[0].timestamp).getFullYear().toString()
    );
    expect(timestamps[1].textContent).toContain(
      new Date(errors[1].timestamp).getFullYear().toString()
    );
    const values = document.querySelectorAll(".error-log-value");
    expect(values[0].textContent).toEqual(
      JSON.stringify(errors[0].error, null, 2)
    );
    expect(values[1].textContent).toEqual(
      JSON.stringify(errors[1].error, null, 2)
    );
  });

  it("replaces error message id with localized message value", () => {
    const errors: ErrorLogItem[] = [
      {
        timestamp: Date.now() - 1000,
        error: new ErrorInfo(ActionType.FETCH_USER, {
          messageId: "connection.error",
        }),
      },
    ];
    (Redux.useSelector as Mock).mockReturnValue(errors);
    renderWithIntl(<ErrorLogViewer />);
    const value = document.querySelector(".error-log-value");
    expect(value!.textContent).toContain(en.messages["connection.error"]);
  });

  it("clears errors on clear errors button click", async () => {
    const errors: ErrorLogItem[] = [
      {
        timestamp: Date.now() - 1000,
        error: new ErrorInfo(ActionType.FETCH_USER, {
          messageId: "connection.error",
        }),
      },
    ];
    (Redux.useSelector as Mock).mockReturnValue(errors);
    const fakeDispatch = vi.fn().mockResolvedValue({});
    (Redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
    vi.spyOn(SyncActions, "clearErrors");
    renderWithIntl(<ErrorLogViewer />);
    const clearButton = screen.getByRole("button", {
      name: en.messages["log-viewer.clear"],
    });
    await userEvent.click(clearButton);
    expect(SyncActions.clearErrors).toHaveBeenCalled();
  });
});
