import * as React from "react";
import {
  Button,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
} from "reactstrap";
import { GoPlus } from "react-icons/go";
import { FaTrashAlt } from "react-icons/fa";
import Utils from "../../util/Utils";
import HelpIcon from "./HelpIcon";
import MultilingualIcon from "./MultilingualIcon";
import BadgeButton from "./BadgeButton";
import "./ValueListEdit.scss";
import { useI18n } from "../hook/useI18n";

interface ValueListEditProps<T extends string | number> {
  type?: "string" | "number";
  list?: T[];
  multilingual?: boolean;
  onChange: (list: T[]) => void;
  i18nPrefix?: string;
  label?: string;
  helpText?: string;
  validator?: (val: string) => boolean;
  invalid?: boolean;
  invalidMessage?: React.ReactNode;
  validationMessage?: string | React.ReactNode;
}

export const ValueListEdit = <T extends string | number = string>({
  list,
  onChange,
  multilingual,
  i18nPrefix,
  label,
  helpText,
  validator,
  invalid,
  invalidMessage,
  validationMessage,
  type = "string",
}: ValueListEditProps<T>) => {
  const { i18n } = useI18n();
  const [inputValue, setInputValue] = React.useState("");

  const canAdd = validator
    ? validator(inputValue)
    : inputValue.trim().length > 0;

  const onAdd = () => {
    if (!canAdd) {
      return;
    }
    const newList = Utils.sanitizeArray(list).slice();
    const value = type === "string" ? inputValue : Number(inputValue);
    newList.push(value as T);
    onChange(newList);
    setInputValue("");
  };
  const onRemove = (item: T) => {
    const newList = Utils.sanitizeArray(list).slice();
    newList.splice(newList.indexOf(item), 1);
    onChange(newList);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onAdd();
    }
  };
  const existingValues = Utils.sanitizeArray(list);

  return (
    <div className="form-group">
      <Label className="attribute-label">
        {label || i18n(`${i18nPrefix}.label`)}
        {multilingual && (
          <MultilingualIcon
            id={"string-list-edit-multilingual" + Utils.hashCode(i18nPrefix)}
          />
        )}
        {(helpText || i18nPrefix) && (
          <HelpIcon
            id={"string-list-edit-help" + Utils.hashCode(i18nPrefix)}
            text={helpText || i18n(`${i18nPrefix}.help`)}
          />
        )}
      </Label>
      <InputGroup className="form-group mb-0">
        <Input
          name="add-string-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          bsSize="sm"
          onKeyDown={onKeyDown}
          invalid={invalid}
          type={type === "number" ? "number" : "text"}
        />
        <InputGroupAddon addonType="append">
          <Button
            key="add-string-submit"
            color="primary"
            size="sm"
            onClick={onAdd}
            className="value-list-add-button"
            disabled={!canAdd}
            title={i18n("stringlistedit.button.add.tooltip")}
          >
            <GoPlus />
            &nbsp;{i18n("stringlistedit.button.add")}
          </Button>
        </InputGroupAddon>
        {invalid && <FormFeedback>{invalidMessage}</FormFeedback>}
        {validationMessage && (
          <FormFeedback
            className="validation-feedback"
            title={i18n("validation.message.tooltip")}
          >
            {validationMessage}
          </FormFeedback>
        )}
      </InputGroup>
      {existingValues.length > 0 && (
        <table>
          <tbody>
            {existingValues.map((s) => (
              <tr key={s}>
                <td className="align-middle">
                  <ul className="mt-0 mb-0">
                    <li>{s}</li>
                  </ul>
                </td>
                <td className="align-middle">
                  <BadgeButton
                    color="danger"
                    outline={true}
                    title={i18n("stringlistedit.button.remove.tooltip")}
                    className="ml-3"
                    onClick={() => onRemove(s)}
                  >
                    <FaTrashAlt /> {i18n("stringlistedit.button.remove")}
                  </BadgeButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ValueListEdit;
