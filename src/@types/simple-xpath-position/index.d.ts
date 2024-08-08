/**
 * Type declarations for simple-xpath-position library.
 */
declare module "simple-xpath-position" {
  export function fromNode(node: Node, root: Node = null): string;
  export function toNode(
    path: string,
    root: Node,
    resolver: any = null
  ): Node | null;
}
