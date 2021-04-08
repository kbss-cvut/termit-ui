import * as React from "react";
import {FormatDateOptions, IntlShape} from "react-intl";

export interface HasI18n {
    i18n(id?: string): string;

    formatMessage(msgId: string, values: {} | undefined): string;

    formatDate(value: string | number | Date, options?: FormatDateOptions): string;

    formatTime(value: string | number | Date, options?: FormatDateOptions): string;

    locale: string;
}

export type WithIntlProps<P> = Pick<P, Exclude<keyof P, keyof HasI18n>> & {
    forwardedRef?: React.Ref<any>;
};

export interface WithI18nOptions {
    forwardRef?: boolean;
}

export default function withI18n<P extends HasI18n = HasI18n>(
    Component: React.ComponentType<P>,
    options?: WithI18nOptions
): React.ComponentClass<WithIntlProps<P> & {intl: IntlShape}> {
    const {forwardRef = false} = options || {};

    class Wrapper extends React.Component<P & {forwardedRef?: React.Ref<any>} & {intl: IntlShape}> {
        protected i18n = (id: string): string => {
            return (this.props.intl.messages[id] as string) || "{" + id + "}";
        };

        protected formatMessage = (msgId: string, values: {} | undefined = {}): string => {
            return this.props.intl.formatMessage({id: msgId}, values);
        };

        protected formatDate = (value: string | number | Date, opts?: FormatDateOptions): string => {
            return this.props.intl.formatDate(value, opts);
        };

        protected formatTime = (value: string | number | Date, opts?: FormatDateOptions): string => {
            return this.props.intl.formatTime(value, opts);
        };

        public render() {
            const props = Object.assign({}, this.props, {
                i18n: this.i18n,
                formatMessage: this.formatMessage,
                formatDate: this.formatDate,
                formatTime: this.formatTime,
                locale: this.props.intl.locale
            });
            return <Component {...props} ref={forwardRef ? this.props.forwardedRef : null} />;
        }
    }

    if (forwardRef) {
        return React.forwardRef<React.ComponentType<P>, P & {intl: IntlShape}>(
            (props: P & {intl: IntlShape}, ref: any) => <Wrapper {...props} forwardedRef={ref} />
        ) as any;
    }
    return Wrapper as any;
}
