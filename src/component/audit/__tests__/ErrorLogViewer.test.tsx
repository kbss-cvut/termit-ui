import * as React from "react";
import ErrorInfo, {ErrorLogItem} from "../../../model/ErrorInfo";
import ActionType from "../../../action/ActionType";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {ErrorLogViewer} from "../ErrorLogViewer";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import en from "../../../i18n/en";

describe("ErrorLogViewer", () => {

    let clearErrors: () => void;

    beforeEach(() => {
        clearErrors = jest.fn();
    });

    it("displays error items with timestamps", () => {
        const errors: ErrorLogItem[] = [{
            timestamp: Date.now() - 1000,
            error: new ErrorInfo(ActionType.FETCH_USER, {message: "Fetch user error"})
        }, {
            timestamp: Date.now(),
            error: new ErrorInfo(ActionType.LOGIN, {message: "Login error"})
        }];
        const wrapper = mountWithIntl(<ErrorLogViewer errors={errors} clearErrors={clearErrors} {...intlFunctions()}/>);
        expect(wrapper.find("tr").length).toEqual(errors.length + 1);   // + header
        const timestamps = wrapper.find(".error-log-timestamp");
        expect(timestamps.at(0).text()).toContain(new Date(errors[0].timestamp).getFullYear());
        expect(timestamps.at(1).text()).toContain(new Date(errors[1].timestamp).getFullYear());
        const values = wrapper.find(".error-log-value");
        expect(values.at(0).text()).toEqual(JSON.stringify(errors[0].error, null, 2));
        expect(values.at(1).text()).toEqual(JSON.stringify(errors[1].error, null, 2));
    });

    it("replaces error message id with localized message value", () => {
        const errors: ErrorLogItem[] = [{
            timestamp: Date.now() - 1000,
            error: new ErrorInfo(ActionType.FETCH_USER, {messageId: "connection.error"})
        }];
        const wrapper = mountWithIntl(<ErrorLogViewer errors={errors} clearErrors={clearErrors} {...intlFunctions()}/>);
        const valueText = wrapper.find(".error-log-value").text();
        expect(valueText).toContain(en.messages["connection.error"]);
    });

    it("clears errors on clear errors button click", () => {
        const errors: ErrorLogItem[] = [{
            timestamp: Date.now() - 1000,
            error: new ErrorInfo(ActionType.FETCH_USER, {messageId: "connection.error"})
        }];
        const wrapper = mountWithIntl(<ErrorLogViewer errors={errors} clearErrors={clearErrors} {...intlFunctions()}/>);
        wrapper.find("button#log-viewer-clear").simulate("click");
        expect(clearErrors).toHaveBeenCalled();
    });
});