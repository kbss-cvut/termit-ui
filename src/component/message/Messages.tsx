import * as React from "react";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import Constants from "../../util/Constants";
import Message from "./Message";
import "./Messages.scss";

interface MessagesProps {
  /**
   * Option to render the container in defined place,
   * rather than floating in the right upper corner
   */
  renderInPlace?: boolean;
}

export const Messages: React.FC<MessagesProps> = ({
  renderInPlace = false,
}) => {
  const messages = useSelector((state: TermItState) => state.messages);
  const count =
    messages.length < Constants.MESSAGE_DISPLAY_COUNT
      ? messages.length
      : Constants.MESSAGE_DISPLAY_COUNT;
  const toRender = messages.slice(0, count);
  return (
    <div
      className={
        (renderInPlace ? "message-fixed-container" : "message-container") +
        (" messages-" + count)
      }
    >
      {toRender.map((m) => (
        <Message key={m.timestamp} message={m} />
      ))}
    </div>
  );
};

export default Messages;
