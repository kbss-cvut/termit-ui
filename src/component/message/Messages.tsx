import * as React from "react";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import Constants from "../../util/Constants";
import Message from "./Message";
import "./Messages.scss";
import classNames from "classnames";

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
      className={classNames(" messages-" + count, {
        "message-fixed-container": renderInPlace,
        "message-container": !renderInPlace,
      })}
    >
      {toRender.map((m) => (
        <Message key={m.timestamp} message={m} />
      ))}
    </div>
  );
};

export default Messages;
