import React from "react";
import { FormGroup, Label } from "reactstrap";
import SearchParam from "../../../model/search/SearchParam";
import Utils from "../../../util/Utils";
import { TriStateCheckbox } from "../../misc/TriStateCheckbox";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { useI18n } from "../../hook/useI18n";

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
      <div className="d-flex justify-content-between">
        <Label className="attribute-label mb-3">{label}</Label>
      </div>
      <TriStateCheckbox
        id={id}
        checked={checked}
        onChange={handleToggle}
        className="relative ml-0"
        hint={i18n("search.no-value.checkbox.hint")}
      />
    </FormGroup>
  );
};
