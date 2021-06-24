/**
 * Type declarations for html-to-react library.
 */
declare module "html-to-react" {
  interface Node {
    type?: string;
    name?: string;
    attribs?: any;
    children?: any[];
  }

  interface Instruction {
    shouldProcessNode?: (node: any) => boolean;
    processNode?: any;
  }

  interface PreprocessingInstruction {
    shouldPreprocessNode?: (node: any) => boolean;
    preprocessNode?: any;
  }

  class ProcessNodeDefinitions {
    constructor(react: object);

    public processDefaultNode: any;
  }

  class Parser {
    constructor(options?: any);

    public parseWithInstructions(
      html: any,
      isValidNode: any,
      processingInstructions: Instruction[],
      preprocessingInstructions?: PreprocessingInstruction[]
    ): any;
  }
}
