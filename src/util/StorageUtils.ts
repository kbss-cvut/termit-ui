export default class StorageUtils {
    public static save(key: string, value: any) {
        localStorage.setItem(key, value);
    }

    public static load(
        key: string,
        defaultValue: string | null = null
    ): string | null {
        const item = localStorage.getItem(key);
        return item !== null ? item : defaultValue;
    }

    public static is(key: string) {
        return Boolean(StorageUtils.load(key, "false"));
    }

    public static clear(key: string) {
        localStorage.removeItem(key);
    }
}
