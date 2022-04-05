import * as React from "react";
import { useMemo } from "react";
import { FormGroup, FormText, Label } from "reactstrap";
import classNames from "classnames";
import ValidationResult from "../../model/form/ValidationResult";
import SimpleMdeReact from "react-simplemde-editor";
import {
  renderHelp,
  renderHint,
  renderValidationMessages,
} from "./AbstractInput";
import Utils from "../../util/Utils";
import SimpleMDE from "easymde";
import "easymde/dist/easymde.min.css";
import { FaMarkdown } from "react-icons/fa";
import { useI18n } from "../hook/useI18n";

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
    renderMarkdownHint,
    validation,
    value,
  } = props;
  const options: SimpleMDE.Options = useMemo(
    () =>
      ({
        autofocus: autoFocus,
        hideIcons: ["fullscreen"],
        maxHeight,
        placeholder,
        sideBySideFullscreen: false,
        spellChecker: false,
        status: false,
      } as SimpleMDE.Options),
    [autoFocus, maxHeight, placeholder]
  );
  return (
    <FormGroup>
      {label && (
        <Label className={classNames("attribute-label", labelClass)}>
          {label}
          {renderHelp(name, help)}
        </Label>
      )}
      <SimpleMdeReact value={value} onChange={onChange} options={options} />
      {renderValidationMessages(Utils.sanitizeArray(validation))}
      {renderHint(hint)}
      {renderMarkdownHint && (
        <FormText>
          <FaMarkdown className="mr-1" />
          {i18n("input.markdown")}
        </FormText>
      )}
    </FormGroup>
  );
};

export default MarkdownEditor;
