import React from "react";
import { FormGroup, Label } from "reactstrap";
import SearchParam from "../../../model/search/SearchParam";
import Utils from "../../../util/Utils";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { useI18n } from "../../hook/useI18n";
import Select from "../../misc/Select";

export const BooleanFacet: React.FC<{
  id: string;
  label: string;
  value: SearchParam;
  onChange: (value: SearchParam) => void;
}> = ({ id, label, value, onChange }) => {
  const { i18n } = useI18n();
  const hasValue = Utils.sanitizeArray(value.value).length > 0;
  const checked = hasValue ? value.value[0] : VocabularyUtils.RDF_NIL;

  const handleToggle = (newValue: boolean | string) => {
    onChange({ ...value, value: [newValue] });
  };

  return (
    <FormGroup>
      <div className="d-flex justify-content-between align-items-end mb-2">
        <Label className="attribute-label mb-0">{label}</Label>
      </div>
      <Select
        id={id}
        value={checked}
        onChange={(e) => handleToggle(e.currentTarget.value)}
      >
        <option value={"true"}>{i18n("boolean.true")}</option>
        <option value={"false"}>{i18n("boolean.false")}</option>
        <option value={VocabularyUtils.RDF_NIL}>{i18n("boolean.none")}</option>
      </Select>
    </FormGroup>
  );
};
