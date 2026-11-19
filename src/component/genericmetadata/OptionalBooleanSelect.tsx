import { FormGroup, Label } from "reactstrap";
import Select from "../misc/Select";
import If from "../misc/If";
import { ChangeEvent, FunctionComponent } from "react";
import { useI18n } from "../hook/useI18n";
import VocabularyUtils from "../../util/VocabularyUtils";
import HelpIcon from "../misc/HelpIcon";
import Utils from "../../util/Utils";

export type TriState = boolean | string;

function asSelectValue(value?: boolean | string): string {
  switch (value) {
    case VocabularyUtils.RDF_NIL:
      return VocabularyUtils.RDF_NIL;
    case true:
    case "true":
      return "true";
    case false:
    case "false":
      return "false";
    default: // fallthrough
    case undefined:
      return "";
  }
}

/**
 * Allows to select 3 possible values of boolean.
 * Possible values: True, False, No Value (represented as {@link VocabularyUtils#RDF_NIL RDF_NIL}).
 * When the value is undefined, the select will display no selected value.
 */
export const OptionalBooleanSelect: FunctionComponent<{
  /**
   * true, false or {@link VocabularyUtils#RDF_NIL RDF_NIL}
   */
  value?: TriState;
  label: string;
  onChange: (value: TriState) => void;
  id?: string;
  className?: string;
  helpText?: string;
}> = ({ value, label, onChange, id, className, helpText }) => {
  const { i18n } = useI18n();

  const selectedValue = asSelectValue(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    switch (e.currentTarget.value) {
      case VocabularyUtils.RDF_NIL:
        return onChange(VocabularyUtils.RDF_NIL);
      case "true":
        return onChange(true);
      case "false":
        return onChange(false);
    }
  };

  return (
    <FormGroup className={className}>
      <div className="d-flex align-items-end mb-2">
        <Label className="attribute-label mb-0">
          {label}{" "}
          {helpText && (
            <HelpIcon
              id={"string-list-edit-help-" + Utils.hashCode(helpText)}
              text={helpText}
            />
          )}
        </Label>
      </div>
      <Select id={id} value={selectedValue} onChange={handleChange}>
        <If expression={selectedValue === ""}>
          <option value={""}></option>
        </If>
        <option value={"true"}>{i18n("boolean.true")}</option>
        <option value={"false"}>{i18n("boolean.false")}</option>
        <option value={VocabularyUtils.RDF_NIL}>{i18n("boolean.none")}</option>
      </Select>
    </FormGroup>
  );
};
