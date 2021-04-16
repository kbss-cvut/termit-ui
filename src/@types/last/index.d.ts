/**
 * Type declarations for the "last" library.
 */
declare module "last" {
    export default function last<T extends (...args: any[]) => any>(
        func: T
    ): (...funcArgs: Parameters<T>) => ReturnType<T>;
}
