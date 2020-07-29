import * as React from "react";
import {useEffect} from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import MessageModel from "../../model/Message";
import {injectIntl} from "react-intl";
import {Alert} from "reactstrap";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {dismissMessage} from "../../action/SyncActions";
import Constants from "../../util/Constants";

interface MessageProps extends HasI18n {
    message: MessageModel,
    dismissMessage: (message: MessageModel) => void
}

export const Message: React.FC<MessageProps> = (props: MessageProps) => {
    const message = props.message;
    useEffect(() => {
        const timer = setTimeout(() => {
            props.dismissMessage(message);
        }, Constants.MESSAGE_DISPLAY_TIMEOUT);
        return () => clearTimeout(timer)
    }, []);

    return <Alert color={message.type} isOpen={true}
                  toggle={() => props.dismissMessage(message)}>{message.messageId ? props.formatMessage(message.messageId, message.values) : message.message}</Alert>;
};

export default connect(null, (dispatch: Dispatch) => {
    return {
        dismissMessage: (message: MessageModel) => dispatch(dismissMessage(message))
    }
})(injectIntl(withI18n(Message)));
