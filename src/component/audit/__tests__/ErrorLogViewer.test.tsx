import * as Redux from "react-redux";
import ErrorInfo, { ErrorLogItem } from "../../../model/ErrorInfo";
import ActionType from "../../../action/ActionType";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import ErrorLogViewer from "../ErrorLogViewer";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import en from "../../../i18n/en";
import * as SyncActions from "../../../action/SyncActions";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe("ErrorLogViewer", () => {
  beforeEach(() => {
    mockUseI18n();
  });

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
    (Redux.useSelector as jest.Mock).mockReturnValue(errors);
    const wrapper = mountWithIntl(<ErrorLogViewer />);
    expect(wrapper.find("tr").length).toEqual(errors.length + 1); // + header
    const timestamps = wrapper.find(".error-log-timestamp");
    expect(timestamps.at(0).text()).toContain(
      new Date(errors[0].timestamp).getFullYear().toString()
    );
    expect(timestamps.at(1).text()).toContain(
      new Date(errors[1].timestamp).getFullYear().toString()
    );
    const values = wrapper.find(".error-log-value");
    expect(values.at(0).text()).toEqual(
      JSON.stringify(errors[0].error, null, 2)
    );
    expect(values.at(1).text()).toEqual(
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
    (Redux.useSelector as jest.Mock).mockReturnValue(errors);
    const wrapper = mountWithIntl(<ErrorLogViewer />);
    const valueText = wrapper.find(".error-log-value").text();
    expect(valueText).toContain(en.messages["connection.error"]);
  });

  it("clears errors on clear errors button click", () => {
    const errors: ErrorLogItem[] = [
      {
        timestamp: Date.now() - 1000,
        error: new ErrorInfo(ActionType.FETCH_USER, {
          messageId: "connection.error",
        }),
      },
    ];
    (Redux.useSelector as jest.Mock).mockReturnValue(errors);
    const fakeDispatch = jest.fn().mockResolvedValue({});
    (Redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
    jest.spyOn(SyncActions, "clearErrors");
    const wrapper = mountWithIntl(<ErrorLogViewer />);
    wrapper.find("button#log-viewer-clear").simulate("click");
    expect(SyncActions.clearErrors).toHaveBeenCalled();
  });
});
