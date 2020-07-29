/**
 * Type declarations for javascript-time-ago
 */

declare module "javascript-time-ago" {
    interface LocaleData {
        locale: string;
        // Standard styles.
        long: object;
        short: object;
        narrow: object;
        // Quantifier.
        quantify: (n: number) => string;
    }

    export function addLocaleData(localeData: LocaleData): void;

    export default class JavascriptTimeAgo {
        constructor(locales?: string | string[]);

        public format(input: Date | number, style?: object): string;

        public formatValue(value: number, unit: string, localeData: object): string;

        public getRule(value: number, unit: string, localeData: object): string;

        public formatNumber(no: number): string;

        public getFormatter(flavor: string): object;

        public getLocaleData(flavor: string | string[]): object;

        public static addLocale(localeData: LocaleData): void;

        public static setDefaultLocale(locale: string): void;

        public static getDefaultLocale(): LocaleData;
    }
}