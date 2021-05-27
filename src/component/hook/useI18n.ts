import { useCallback } from "react";
import { HasI18n } from "../hoc/withI18n";
import { useIntl } from "react-intl";

/**
 * React Hook providing basic i18n functions.
 */
export function useI18n(): HasI18n {
  const intl = useIntl();
  const i18n = useCallback(
    (msgId: string) => (intl.messages[msgId] as string) || "{" + msgId + "}",
    [intl]
  );
  const formatMessage = useCallback(
    (msgId: string, values: {} | undefined = {}) =>
      intl.formatMessage({ id: msgId }, values),
    [intl]
  );
  return {
    i18n,
    formatMessage,
    formatDate: intl.formatDate,
    formatTime: intl.formatTime,
    locale: intl.locale,
  };
}
