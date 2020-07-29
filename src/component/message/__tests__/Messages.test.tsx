import * as React from "react";
import {Messages} from "../Messages";
import MessageModel from "../../../model/Message";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {Message} from "../Message";
import Constants from "../../../util/Constants";

describe("Messages", () => {

    let messages: MessageModel[];

    beforeEach(() => {
        messages = [];
        for (let i = 0; i < Constants.MESSAGE_DISPLAY_COUNT + 3; i++) {
            messages.push(new MessageModel({message: "Test" + i}));
            // @ts-ignore
            messages[i].mTimestamp = Date.now() - 1000 * i;
        }
    });

    it("renders configured number of messages", () => {
        const wrapper = mountWithIntl(<Messages messages={messages}/>);
        const messagesDisplayed = wrapper.find(Message);
        expect(messagesDisplayed.length).toEqual(Constants.MESSAGE_DISPLAY_COUNT);
    });

    it("renders all messages when their number is less than configured max", () => {
        const toRender = messages.slice(0, Constants.MESSAGE_DISPLAY_COUNT - 1);
        const wrapper = mountWithIntl(<Messages messages={toRender}/>);
        const messagesDisplayed = wrapper.find(Message);
        expect(messagesDisplayed.length).toEqual(toRender.length);
    });
});
