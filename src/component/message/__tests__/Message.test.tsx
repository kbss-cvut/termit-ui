import { Message } from "../Message";
import MessageModel from "../../../model/Message";
import {
  mockStore,
  renderWithIntl,
} from "../../../__tests__/environment/Environment";
import Constants from "../../../util/Constants";
import ActionType from "../../../action/ActionType";
import { fireEvent } from "@testing-library/react";

describe("Message", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, "setTimeout");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("displays alert with specified message text", () => {
    const message: MessageModel = new MessageModel({
      message: "Error message",
    });
    const { container } = renderWithIntl(<Message message={message} />);
    expect(container).toHaveTextContent(message.message!);
  });

  it("displays alert with formatted message with correct values", () => {
    const message = new MessageModel({
      messageId: "vocabulary.summary.title",
      values: { name: "Test" },
    });
    const { container } = renderWithIntl(<Message message={message} />);
    expect(container).toHaveTextContent("Test - Summary");
  });

  it("publishes dismiss action on alert toggle", () => {
    const message: MessageModel = new MessageModel({
      message: "Error message",
    });
    const { container } = renderWithIntl(<Message message={message} />);
    fireEvent.click(container.querySelector("button.close")!);
    expect(
      mockStore.getActions().find((a) => a.type === ActionType.DISMISS_MESSAGE)
    ).toBeDefined();
  });

  it("sets timer to dismiss message after configured timeout", () => {
    const message: MessageModel = new MessageModel({
      message: "Error message",
    });
    renderWithIntl(<Message message={message} />);
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
    renderWithIntl(<Message message={message} />);
    vi.runAllTimers();
    expect(
      mockStore.getActions().find((a) => a.type === ActionType.DISMISS_MESSAGE)
    ).toBeDefined();
  });
});
