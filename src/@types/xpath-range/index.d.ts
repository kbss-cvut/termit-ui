/**
 * Type declarations for xpath-range library.
 */
declare module "xpath-range" {

    interface XPathRange {
        start: string,
        end: string,
        startOffset: number,
        endOffset: number,
    }

    export function toRange(startPath: string, startOffset: number, endPath: string, endOffset: number, root: Node): Range;
    export function fromRange(range: Range, root: Node): XPathRange;
}