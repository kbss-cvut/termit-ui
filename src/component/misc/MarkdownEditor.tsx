import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormGroup, FormText, Label } from "reactstrap";
import classNames from "classnames";
import EasyMDE from "easymde";
import { FaMarkdown } from "react-icons/fa";
import SimpleMdeReact from "react-simplemde-editor";
import { Editor } from "codemirror";
import ValidationResult from "../../model/form/ValidationResult";
import {
  renderHelp,
  renderHint,
  renderValidationMessages,
} from "./AbstractInput";
import Utils from "../../util/Utils";
import { useI18n } from "../hook/useI18n";
import "easymde/dist/easymde.min.css";
import "./MarkdownEditor.scss";
import { marked } from "marked";

interface MarkdownEditorProps {
  name: string;
  label?: string | JSX.Element;
  labelClass?: string;
  placeholder?: string;
  title?: string;
  value?: string;
  onChange?: (value: string) => void;
  /**
   * Hint text is displayed under the input field in a smaller, muted font.
   *
   * Hint text should be short, not disturbing.
   */
  hint?: string | JSX.Element;
  /**
   * Help is displayed in a popup on hover/click on the help icon displayed next to the input label.
   *
   * Help text may be longer and contain detailed explanation of more complex concepts.
   */
  help?: string;
  validation?: ValidationResult | ValidationResult[];
  autoFocus?: boolean;
  renderMarkdownHint?: boolean;
  maxHeight?: string;
  readOnly?: boolean;
}

const READONLY_TOOLBAR = ["preview", "side-by-side"];
// Add editing icons (after separator) in reverse order, since we are using float: right to make them appear
// on the right side of the toolbar
const EDITOR_TOOLBAR = [
  "preview",
  "side-by-side",
  "|",
  "guide",
  "image",
  "ordered-list",
  "unordered-list",
  "link",
  "italic",
  "bold",
  "heading",
];

/**
 * Modify HTML to add 'target="_blank"' to links so they open in new tabs by default.
 * @param {string} htmlText - HTML to be modified.
 * @return {string} The modified HTML text.
 * @see https://github.com/Ionaru/easy-markdown-editor/tree/041594ae4a0de20bc536ededd61eceb981fcb568/src/js/easymde.js#L96
 * @author Sparksuite, Inc., Jeroen Akkerman.
 */
function addAnchorTargetBlank(htmlText: string): string {
  const anchorToExternalRegex = new RegExp(/(<a.*?https?:\/\/.*?[^a]>)+?/g);
  let match;
  while ((match = anchorToExternalRegex.exec(htmlText)) !== null) {
    // With only one capture group in the RegExp, we can safely take the first index from the match.
    const linkString = match[0];

    if (linkString.indexOf("target=") === -1) {
      const fixedLinkString = linkString.replace(/>$/, ' target="_blank">');
      htmlText = htmlText.replace(linkString, fixedLinkString);
    }
  }
  return htmlText;
}

/**
 * Modify HTML to remove the list-style when rendering checkboxes.
 * @param {string} htmlText - HTML to be modified.
 * @return {string} The modified HTML text.
 * @see https://github.com/Ionaru/easy-markdown-editor/blob/041594ae4a0de20bc536ededd61eceb981fcb568/src/js/easymde.js#L115
 * @author Sparksuite, Inc., Jeroen Akkerman.
 */
function removeListStyleWhenCheckbox(htmlText: string): string {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(htmlText, "text/html");
  const listItems = htmlDoc.getElementsByTagName("li");

  for (let i = 0; i < listItems.length; i++) {
    const listItem = listItems[i];

    for (let j = 0; j < listItem.children.length; j++) {
      const listItemChild = listItem.children[j];

      if (
        listItemChild instanceof HTMLInputElement &&
        listItemChild.type === "checkbox"
      ) {
        // From Github: margin: 0 .2em .25em -1.6em;
        listItem.style.marginLeft = "-1.5em";
        listItem.style.listStyleType = "none";
      }
    }
  }

  return htmlDoc.documentElement.innerHTML;
}

/**
 * Once we upgraded easymde from version 2.15.0 to 2.18.0, the Markdown editor stopped working
 * (the preview was blank - [GitHub issue](https://github.com/RIP21/react-simplemde-editor/issues/197)).
 * The breaking change happened in easymde 2.16.1-30.0, published on 14.1.2022,
 * where a security issue in marked dependency was addressed.
 * Version easymde 2.16.1-29.0 is fine.
 * Following packages were upgraded:
 * - easymde: 2.15.0 -> 2.18.0
 * - react-simplemde-editor: ^5.0.2 -> ^5.2.0
 *
 * Added package:
 * - marked: ^9.1.6 (v10s drops support for node v16)
 *
 * To keep the editor working, this function will substitute the preview renderer in EasyMDE (until it gets somehow fixed).
 * @see https://github.com/Ionaru/easy-markdown-editor/blob/a6b121f2e6436fb3b7e3705fe5ca1ba1c991e0a9/src/js/easymde.js#L2059
 */
function previewRender(markdown: string, element: HTMLElement): string {
  if (!markdown) {
    return "";
  }

  // options for marked (substitutes renderingConfig from EasyMDE.Options)
  marked.setOptions({ breaks: true });

  // @ts-ignore
  let htmlText: string = marked.parse(markdown) || "";
  htmlText = addAnchorTargetBlank(htmlText);
  htmlText = removeListStyleWhenCheckbox(htmlText);

  return htmlText;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  const { i18n } = useI18n();
  const {
    autoFocus,
    help,
    hint,
    label,
    labelClass,
    maxHeight,
    name,
    onChange,
    placeholder,
    readOnly,
    renderMarkdownHint,
    validation,
    value,
  } = props;
  const options: EasyMDE.Options = useMemo(
    // as long as previewRenderer is used, renderingConfig won't work here
    (): EasyMDE.Options => ({
      previewRender,
      autofocus: autoFocus,
      maxHeight,
      placeholder,
      previewClass: readOnly
        ? ["editor-preview", "markdown-editor-readonly"]
        : "editor-preview",
      sideBySideFullscreen: false,
      spellChecker: false,
      status: false,
      // @ts-ignore missing export for ToolbarButton from EasyMDE
      toolbar: readOnly ? READONLY_TOOLBAR : EDITOR_TOOLBAR,
    }),
    [autoFocus, maxHeight, placeholder, readOnly]
  );
  const [easyMdeInstance, setMdeInstance] = useState<EasyMDE | null>(null);
  const getMdeInstanceCallback = useCallback((easyMde: EasyMDE) => {
    setMdeInstance(easyMde);
  }, []);

  const [codemirrorInstance, setCodemirrorInstance] =
    useState<Editor | null>(null);
  const getCmInstanceCallback = useCallback((editor: Editor) => {
    setCodemirrorInstance(editor);
  }, []);
  useEffect(() => {
    if (readOnly) {
      codemirrorInstance?.setOption("readOnly", readOnly);
      // @ts-ignore
      easyMdeInstance?.togglePreview();
    }
  }, [codemirrorInstance, readOnly, easyMdeInstance]);

  return (
    <FormGroup>
      {label && (
        <Label className={classNames("attribute-label", labelClass)}>
          {label}
          {renderHelp(name, help)}
        </Label>
      )}
      <SimpleMdeReact
        id={name}
        value={value}
        onChange={onChange}
        options={options}
        getMdeInstance={getMdeInstanceCallback}
        getCodemirrorInstance={getCmInstanceCallback}
      />
      {renderMarkdownHint && (
        <FormText>
          <FaMarkdown className="mr-1" />
          {i18n("input.markdown")}
        </FormText>
      )}
      {renderHint(hint)}
      {renderValidationMessages(Utils.sanitizeArray(validation))}
    </FormGroup>
  );
};

export default MarkdownEditor;
