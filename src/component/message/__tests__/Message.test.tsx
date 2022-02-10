import { Message } from "../Message";
import MessageModel from "../../../model/Message";
import {
  mockStore,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import Constants from "../../../util/Constants";
import ActionType from "../../../action/ActionType";

describe("Message", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("displays alert with specified message text", () => {
    const message: MessageModel = new MessageModel({
      message: "Error message",
    });
    const wrapper = mountWithIntl(<Message message={message} />);
    expect(wrapper.text()).toContain(message.message);
  });

  it("displays alert with formatted message with correct values", () => {
    const message = new MessageModel({
      messageId: "vocabulary.summary.title",
      values: { name: "Test" },
    });
    const wrapper = mountWithIntl(<Message message={message} />);
    expect(wrapper.text()).toContain("Test - Summary");
  });

  it("publishes dismiss action on alert toggle", () => {
    const message: MessageModel = new MessageModel({
      message: "Error message",
    });
    const wrapper = mountWithIntl(<Message message={message} />);
    wrapper.find("button.close").simulate("click");
    expect(
      mockStore.getActions().find((a) => a.type === ActionType.DISMISS_MESSAGE)
    ).toBeDefined();
  });

  it("sets timer to dismiss message after configured timeout", () => {
    const message: MessageModel = new MessageModel({
      message: "Error message",
    });
    mountWithIntl(<Message message={message} />);
    expect(setTimeout).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      Constants.MESSAGE_DISPLAY_TIMEOUT
    );
  });

  it("dismisses alert after timeout has expired", () => {
    const message: MessageModel = new MessageModel({
      message: "Error message",
    });
    mountWithIntl(<Message message={message} />);
    jest.runAllTimers();
    expect(
      mockStore.getActions().find((a) => a.type === ActionType.DISMISS_MESSAGE)
    ).toBeDefined();
  });
});
