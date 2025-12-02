import React from "react";
import SearchParam from "../../../model/search/SearchParam";
import { FormGroup, Label } from "reactstrap";
import CustomInput from "../../misc/CustomInput";

export const NumberFacet: React.FC<{
  id: string;
  label: string;
  value: SearchParam;
  onChange: (newValue: SearchParam) => void;
}> = ({ id, label, value, onChange }) => {
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result: SearchParam = { ...value };
    result.value =
      e.currentTarget.value.length > 0 ? [Number(e.currentTarget.value)] : [];
    onChange(result);
  };
  return (
    <>
      <FormGroup>
        <div className="d-flex justify-content-between">
          <Label className="attribute-label mb-3">{label}</Label>
        </div>
        <CustomInput
          id={id}
          type="number"
          onChange={onInputChange}
          value={value.value.length > 0 ? value.value[0] : ""}
        />
      </FormGroup>
    </>
  );
};
