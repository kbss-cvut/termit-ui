import * as React from "react";
import {useCallback, useEffect} from "react";
import MessageModel from "../../model/Message";
import {Alert} from "reactstrap";
import {useDispatch} from "react-redux";
import {dismissMessage} from "../../action/SyncActions";
import Constants from "../../util/Constants";
import {useI18n} from "../hook/useI18n";

interface MessageProps {
    message: MessageModel;
}

export const Message: React.FC<MessageProps> = (props: MessageProps) => {
    const {message} = props;
    const {formatMessage} = useI18n();
    const dispatch = useDispatch();
    const dismiss = useCallback(() => dispatch(dismissMessage(message)), [message, dispatch]);
    useEffect(() => {
        const timer = setTimeout(() => {
            dismiss();
        }, Constants.MESSAGE_DISPLAY_TIMEOUT);
        return () => clearTimeout(timer);
    }, [dismiss, message]);

    return (
        <Alert color={message.type} isOpen={true} toggle={dismiss}>
            {message.messageId ? formatMessage(message.messageId, message.values) : message.message}
        </Alert>
    );
};

export default Message;
