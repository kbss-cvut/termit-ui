import * as React from "react";
import {Message} from "../Message";
import MessageModel from "../../../model/Message";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Constants from "../../../util/Constants";

jest.useFakeTimers();

describe("Message", () => {

    let dismissMessage: (message: MessageModel) => void;

    beforeEach(() => {
        dismissMessage = jest.fn();
    });

    it("displays alert with specified message text", () => {
        const message: MessageModel = new MessageModel({message: "Error message"});
        const wrapper = mountWithIntl(<Message message={message}
                                               dismissMessage={dismissMessage} {...intlFunctions()}/>);
        expect(wrapper.text()).toContain(message.message);
    });

    it("displays alert with formatted message with correct values", () => {
        const message = new MessageModel({messageId: "vocabulary.summary.title", values: {name: "Test"}});
        const wrapper = mountWithIntl(<Message message={message}
                                               dismissMessage={dismissMessage} {...intlFunctions()}/>);
        expect(wrapper.text()).toContain("Test - Summary");
    });

    it("publishes dismiss action on alert toggle", () => {
        const message: MessageModel = new MessageModel({message: "Error message"});
        const wrapper = mountWithIntl(<Message message={message}
                                               dismissMessage={dismissMessage} {...intlFunctions()}/>);
        wrapper.find("button.close").simulate("click");
        expect(dismissMessage).toHaveBeenCalledWith(message);
    });

    it("sets timer to dismiss message after configured timeout", () => {
        const message: MessageModel = new MessageModel({message: "Error message"});
        mountWithIntl(<Message message={message} dismissMessage={dismissMessage} {...intlFunctions()}/>);
        expect(setTimeout).toHaveBeenCalled();
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), Constants.MESSAGE_DISPLAY_TIMEOUT);
    });

    it("dismisses alert after timeout has expired", () => {
        const message: MessageModel = new MessageModel({message: "Error message"});
        mountWithIntl(<Message message={message} dismissMessage={dismissMessage} {...intlFunctions()}/>);
        jest.runAllTimers();
        expect(dismissMessage).toHaveBeenCalledWith(message);
    });
});