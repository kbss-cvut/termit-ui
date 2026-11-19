import React from "react";
import SearchParam from "../../../model/search/SearchParam";
import Utils from "../../../util/Utils";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { OptionalBooleanSelect } from "../../genericmetadata/OptionalBooleanSelect";

export const BooleanFacet: React.FC<{
  id: string;
  label: string;
  value: SearchParam;
  onChange: (value: SearchParam) => void;
}> = ({ id, label, value, onChange }) => {
  const hasValue = Utils.sanitizeArray(value.value).length > 0;
  const checked = hasValue ? value.value[0] : "";

  const handleToggle = (newValue: boolean | null | string) => {
    if (newValue == null) {
      newValue = VocabularyUtils.RDF_NIL;
    }
    onChange({ ...value, value: [newValue] });
  };

  return (
    <OptionalBooleanSelect
      value={checked}
      label={label}
      onChange={handleToggle}
      id={id}
    />
  );
};
