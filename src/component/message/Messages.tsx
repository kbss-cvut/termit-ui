import * as React from "react";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import MessageModel from "../../model/Message";
import Constants from "../../util/Constants";
import Message from "./Message";
import "./Messages.scss";

interface MessagesProps {
    messages: MessageModel[]
}

export const Messages: React.FC<MessagesProps> = (props) => {
    const count = props.messages.length < Constants.MESSAGE_DISPLAY_COUNT ? props.messages.length : Constants.MESSAGE_DISPLAY_COUNT;
    const toRender = props.messages.slice(0, count);
    return <div className={"message-container messages-" + count}>
        {toRender.map(m => <Message key={m.timestamp} message={m}/>)}
    </div>
};

export default connect((state: TermItState) => {
    return {
        messages: state.messages
    };
})(Messages);
