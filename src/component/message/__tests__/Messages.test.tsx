import { Messages } from "../Messages";
import MessageModel from "../../../model/Message";
import { Message } from "../Message";
import Constants from "../../../util/Constants";
import * as redux from "react-redux";
import { Mock, vi } from "vitest";
import { shallow } from "enzyme";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe("Messages", () => {
  let messages: MessageModel[];

  beforeEach(() => {
    messages = [];
    for (let i = 0; i < Constants.MESSAGE_DISPLAY_COUNT + 3; i++) {
      messages.push(new MessageModel({ message: "Test" + i }));
      // @ts-ignore
      messages[i].mTimestamp = Date.now() - 1000 * i;
    }
  });

  it("renders configured number of messages", () => {
    (redux.useSelector as Mock).mockReturnValue(messages);
    const wrapper = shallow(<Messages />);
    const messagesDisplayed = wrapper.find(Message);
    expect(messagesDisplayed.length).toEqual(Constants.MESSAGE_DISPLAY_COUNT);
  });

  it("renders all messages when their number is less than configured max", () => {
    const toRender = messages.slice(0, Constants.MESSAGE_DISPLAY_COUNT - 1);
    (redux.useSelector as Mock).mockReturnValue(toRender);
    const wrapper = shallow(<Messages />);
    const messagesDisplayed = wrapper.find(Message);
    expect(messagesDisplayed.length).toEqual(toRender.length);
  });
});
