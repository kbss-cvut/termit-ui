import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormGroup, FormText, Label } from "reactstrap";
import classNames from "classnames";
import SimpleMDE from "easymde";
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
  const options: SimpleMDE.Options = useMemo(
    () =>
      ({
        autofocus: autoFocus,
        maxHeight,
        placeholder,
        previewClass: readOnly
          ? ["editor-preview", "markdown-editor-readonly"]
          : "editor-preview",
        sideBySideFullscreen: false,
        spellChecker: false,
        status: false,
        toolbar: readOnly ? READONLY_TOOLBAR : EDITOR_TOOLBAR,
      } as SimpleMDE.Options),
    [autoFocus, maxHeight, placeholder, readOnly]
  );
  const [simpleMdeInstance, setMdeInstance] = useState<SimpleMDE | null>(null);
  const getMdeInstanceCallback = useCallback((simpleMde: SimpleMDE) => {
    setMdeInstance(simpleMde);
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
      simpleMdeInstance?.togglePreview();
    }
  }, [codemirrorInstance, readOnly, simpleMdeInstance]);

  return (
    <FormGroup>
      {label && (
        <Label className={classNames("attribute-label", labelClass)}>
          {label}
          {renderHelp(name, help)}
        </Label>
      )}
      <SimpleMdeReact
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
