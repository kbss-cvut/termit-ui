import React from "react";
import { TermSelector } from "../../term/TermSelector";
import Term from "../../../model/Term";
import SearchParam from "../../../model/search/SearchParam";
import { FormGroup, Label } from "reactstrap";

export const TermSelectorFacet: React.FC<{
  id: string;
  label: string;
  value: SearchParam;
  onChange: (value: SearchParam) => void;
}> = ({ id, label, value, onChange }) => {
  const onSelect = (values: readonly Term[]) => {
    onChange({ ...value, value: values.map((v) => v.iri) });
  };

  return (
    <FormGroup>
      <div className="d-flex justify-content-between">
        <Label className="attribute-label mb-3">{label}</Label>
      </div>
      <TermSelector
        id={id}
        value={value.value}
        onChange={onSelect}
        forceFlatList={true}
      />
    </FormGroup>
  );
};
