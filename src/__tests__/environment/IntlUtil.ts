import { createIntl, FormatDateOptions, IntlShape } from "react-intl";
import intlData from "../../i18n/en";
import { HasI18n } from "../../component/hoc/withI18n";
import * as useI18n from "../../component/hook/useI18n";

const intlInst = createIntl(intlData);

export function intl(): IntlShape {
  return intlInst;
}

export function i18n(id: string): string {
  return intlData.messages[id];
}

export function formatMessage(id: string, values: {}): string {
  return intlInst.formatMessage({ id }, values);
}

export function formatDate(
  value: string | number | Date,
  opts?: FormatDateOptions
): string {
  return intlInst.formatDate(value, opts);
}

export function formatTime(
  value: string | number | Date,
  opts?: FormatDateOptions
): string {
  return intlInst.formatTime(value, opts);
}

/**
 * Provides intl functions/values expected by the Has18n props interface.
 */
export function intlFunctions(): HasI18n {
  return {
    i18n,
    formatMessage,
    formatDate,
    formatTime,
    locale: intlData.locale,
  };
}

/**
 * Mocks the useI18n hook.
 */
export function mockUseI18n() {
  jest.spyOn(useI18n, "useI18n").mockReturnValue({ ...intlFunctions() });
}
