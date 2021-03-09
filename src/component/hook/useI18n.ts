import {HasI18n} from "../hoc/withI18n";
import {useIntl} from "react-intl";

export function useI18n(): HasI18n {
    const intl = useIntl();
    const i18n = (msgId: string) => intl.messages[msgId] as string || ("{" + msgId + "}");
    const formatMessage = (msgId: string, values: {} | undefined = {}) => intl.formatMessage({id: msgId}, values);
    return {
        i18n,
        formatMessage,
        formatDate: intl.formatDate,
        formatTime: intl.formatTime,
        locale: intl.locale
    };
}
