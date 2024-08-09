export const PUNCTUATION_CHARS = [".", ",", "!", "?", ":", ";"];
const PUNCTUATION_REGEX = PUNCTUATION_CHARS.map(escapeRegExp).join("");

/**
 * Allows manipulation with the first {@link Range} in the {@link Selection}.<br>
 * <p>
 * Every action manipulates the inner range, to apply the changes to the selection
 * use {@link TextSelection#restoreSelection()} method.
 * <p>
 * Using the Range has the advantage that there is no need to deal with the direction of selection,
 * the beginning of the range is always before the end of the range.
 * @see https://javascript.info/selection-range#selection
 */
export default class TextSelection {
  private readonly selection: Selection;
  private readonly range: Range;
  private readonly container: Node;

  /**
   * @param selection The {@link Selection}
   * @param container the selection never extends beyond it
   * @see the Class {@link TextSelection}
   * @throws Error when <code>selection</code> is undefined, there is nothing selected (no range inside the selection) or the selection is collapsed
   */
  constructor(selection: Selection, container: Node) {
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      throw new Error("Invalid selection");
    }

    this.selection = selection;
    this.container = container;
    // currently no browser other than firefox supports multiple range selection
    // and in termit it does not make any sense
    this.range = selection.getRangeAt(0).cloneRange();
  }

  /**
   * Removes whitespace and {@link PUNCTUATION_CHARS} characters from the string start
   */
  private trimStringLeft(str: string) {
    return str
      .trimStart()
      .replace(new RegExp(`^[${PUNCTUATION_REGEX}\\s)]+`, "g"), "");
  }

  /**
   * Removes whitespace and {@link PUNCTUATION_CHARS} characters from the string end
   */
  private trimStringRight(str: string) {
    return str
      .trimEnd()
      .replace(new RegExp(`[${PUNCTUATION_REGEX}\\s(]+$`, "g"), "");
  }

  /**
   * Clears the selection and applies the range inside this object.
   */
  restoreSelection() {
    this.selection.removeAllRanges();
    this.selection.addRange(this.range.cloneRange());
  }

  /**
   * Sets {@link #range#startContainer} to a text node when possible
   */
  private diveStartToTextNode() {
    const it = createIteratorAtChild(this.container, this.range.startContainer);
    let node;
    do {
      node = it.nextNode();
    } while (node && node.nodeType !== Node.TEXT_NODE);
    if (node?.nodeType === Node.TEXT_NODE) {
      let offset = this.range.startOffset;
      if (node !== this.range.startContainer) {
        offset = 0;
      }
      this.range.setStart(node, offset);
    }
  }

  /**
   * Sets {@link #range#endContainer} to a text node when possible
   */
  private diveEndToTextNode() {
    const it = createIteratorAtChild(this.container, this.range.endContainer);
    let node;
    it.nextNode(); // include current node
    do {
      node = it.previousNode();
    } while (node && node.nodeType !== Node.TEXT_NODE);
    if (node?.nodeType === Node.TEXT_NODE) {
      let offset = this.range.endOffset;
      if (node !== this.range.endContainer) {
        offset = node.textContent?.length || 0;
      }
      this.range.setEnd(node, offset);
    }
  }

  /**
   * Moves {@link #range#startContainer} to the next text node,
   * if there is no text node available, the node is unchanged
   * @returns true if node was changed, false otherwise
   */
  private moveStartToNextTextNode() {
    const it = createIteratorAtChild(this.container, this.range.startContainer);
    it.nextNode(); // skip current child (startContainer)
    let node;
    do {
      node = it.nextNode();
    } while (node && node.nodeType !== Node.TEXT_NODE);
    if (node?.nodeType === Node.TEXT_NODE) {
      this.range.setStart(node, 0);
      return true;
    }
    return false;
  }

  /**
   * Moves {@link #range#endContainer} to the next text node,
   * if there is no text node available, the node is unchanged
   * @returns true if node was changed, false otherwise
   */
  private moveEndToNextTextNode() {
    const it = createIteratorAtChild(this.container, this.range.endContainer);
    it.nextNode(); // skip current child (endContainer)
    let node;
    do {
      node = it.nextNode();
    } while (node && node.nodeType !== Node.TEXT_NODE);
    if (node?.nodeType === Node.TEXT_NODE) {
      this.range.setEnd(node, 0);
      return true;
    }
    return false;
  }

  /**
   * Moves {@link #range#startContainer} to the prev text node,
   * if there is no text node available, the node is unchanged
   * @returns true if node was changed, false otherwise
   */
  private moveStartToPrevTextNode() {
    const it = createIteratorAtChild(this.container, this.range.startContainer);
    let node;
    do {
      node = it.previousNode();
    } while (node && node.nodeType !== Node.TEXT_NODE);
    if (node?.nodeType === Node.TEXT_NODE) {
      const offset = node.textContent?.length || 0;
      this.range.setStart(node, offset);
      return true;
    }
    return false;
  }

  /**
   * Moves {@link #range#endContainer} to the prev text node,
   * if there is no text node available, the node is unchanged
   * @returns true if node was changed, false otherwise
   */
  private moveEndToPrevTextNode() {
    const it = createIteratorAtChild(this.container, this.range.endContainer);
    let node;
    do {
      node = it.previousNode();
    } while (node && node.nodeType !== Node.TEXT_NODE);
    if (node?.nodeType === Node.TEXT_NODE) {
      const offset = node.textContent?.length || 0;
      this.range.setEnd(node, offset);
      return true;
    }
    return false;
  }

  /**
   * @returns string A part of the text in {@link #range#startContainer} respecting the {@link #range#startOffset}
   */
  private getStartOffsetText() {
    const { startContainer, startOffset } = this.range;
    const text = startContainer.textContent || "";
    return text.slice(startOffset);
  }

  /**
   * @returns string A whole text in {@link #range#startContainer} or empty string
   */
  private getStartText() {
    return this.range.startContainer.textContent || "";
  }

  /**
   * @returns string A whole text in {@link #range#endContainer} or empty string
   */
  private getEndText() {
    return this.range.endContainer.textContent || "";
  }

  /**
   * @returns string A part of the text in {@link #range#endContainer} respecting the {@link #range#endOffset}
   */
  private getEndOffsetText() {
    const { endContainer, endOffset } = this.range;
    const text = endContainer.textContent || "";
    return text.slice(0, endOffset);
  }

  /**
   * Moves the start of the {@link #range} to the left as long as there is no whitespace/punctuation
   * @see the trim method {@link #trimStringLeft}
   */
  private extendStart() {
    this.diveStartToTextNode();
    let oldContainer = this.range.startContainer;
    let oldOffset = this.range.startOffset;
    while (
      this.getStartOffsetText().length ===
      this.trimStringLeft(this.getStartOffsetText()).length
    ) {
      oldContainer = this.range.startContainer;
      oldOffset = this.range.startOffset;
      const { startContainer, startOffset } = this.range;
      const newOffset = startOffset - 1;
      if (newOffset < 0) {
        if (this.moveStartToPrevTextNode()) {
          continue;
        } else {
          break;
        }
      }
      this.range.setStart(startContainer, newOffset);
    }
    // restore last action
    this.range.setStart(oldContainer, oldOffset);
  }

  /**
   * Moves the end of the {@link #range} to the right as long as there is no whitespace/punctuation
   * @see the trim method {@link #trimStringRight}
   */
  private extendEnd() {
    this.diveEndToTextNode();
    let oldContainer = this.range.endContainer;
    let oldOffset = this.range.endOffset;
    while (
      this.getEndOffsetText().length ===
      this.trimStringRight(this.getEndOffsetText()).length
    ) {
      oldContainer = this.range.endContainer;
      oldOffset = this.range.endOffset;
      const { endContainer, endOffset } = this.range;
      const newOffset = endOffset + 1;
      if (newOffset >= this.getEndText().length) {
        if (this.moveEndToNextTextNode()) {
          continue;
        } else {
          break;
        }
      }
      this.range.setEnd(endContainer, newOffset);
    }
    // restore last action
    this.range.setEnd(oldContainer, oldOffset);
  }

  /**
   * Moves the start of the {@link #range} to the right as long as there is a whitespace/punctuation
   * @see the trim method {@link #trimStringLeft}
   */
  private trimStart() {
    this.diveStartToTextNode();
    while (
      this.trimStringLeft(this.getStartOffsetText()).length !==
        this.getStartOffsetText().length ||
      this.getStartOffsetText().length === 0
    ) {
      const { startContainer, startOffset } = this.range;
      const newOffset = startOffset + 1;
      if (newOffset >= this.getStartText().length) {
        if (this.moveStartToNextTextNode()) {
          continue;
        } else {
          break;
        }
      }
      this.range.setStart(startContainer, newOffset);
    }
  }

  /**
   * Moves the end of the {@link #range} to the right as long as there is a whitespace/punctuation
   * @see the trim method {@link #trimStringRight}
   */
  private trimEnd() {
    this.diveEndToTextNode();
    while (
      this.trimStringRight(this.getEndOffsetText()).length !==
        this.getEndOffsetText().length ||
      this.getEndOffsetText().length === 0
    ) {
      const { endContainer, endOffset } = this.range;
      const newOffset = endOffset - 1;
      if (newOffset < 0) {
        if (this.moveEndToPrevTextNode()) {
          continue;
        } else {
          break;
        }
      }
      this.range.setEnd(endContainer, newOffset);
    }
  }

  /**
   * Trims or extends the start of the range to remove leading spaces/punctuation, or to contain whole word
   * @see punctuation constant {@link PUNCTUATION_CHARS}
   */
  adjustStart() {
    if (
      this.trimStringLeft(this.getStartOffsetText()).length !==
        this.getStartOffsetText().length ||
      this.getStartOffsetText().length === 0
    ) {
      this.trimStart();
    } else {
      this.extendStart();
      this.trimStart();
    }
  }

  /**
   * Trims or extends the end of the range to remove trailing spaces/punctuation, or to contain whole word
   * @see punctuation constant {@link PUNCTUATION_CHARS}
   */
  adjustEnd() {
    if (
      this.trimStringRight(this.getEndOffsetText()).length !==
        this.getEndOffsetText().length ||
      this.getEndOffsetText().length === 0
    ) {
      this.trimEnd();
    } else {
      this.extendEnd();
      this.trimEnd();
    }
  }
}

/**
 * @returns an iterator {@link NodeIterator} at the child position (calling nextNode will return the child)
 * @param parent parent node of the child
 * @param child Node that is a child of the parent
 */
function createIteratorAtChild(parent: Node, child: Node) {
  const it = document.createNodeIterator(parent);
  let node;
  do {
    node = it.nextNode();
  } while (node && node !== child);
  it.previousNode();
  return it;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
