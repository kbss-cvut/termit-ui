import React from "react";
import SearchParam from "../../../model/search/SearchParam";
import { FormGroup, Label } from "reactstrap";
/* @ts-ignore */
import { IntelligentTreeSelect } from "intelligent-tree-select";

type SelectOption = {
  value: string;
  label: string;
  parent?: string;
  children?: string[];
};

interface MultiSelectFacetProps {
  id: string;
  label: string;
  value: SearchParam;
  onChange: (newValue: SearchParam) => void;
  options: SelectOption[];
  renderAsTree?: boolean;
}

const MultiSelectFacet: React.FC<MultiSelectFacetProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  renderAsTree = false,
}) => {
  const onSelect = (values: SelectOption[]) => {
    const newValue = Object.assign({}, value);
    newValue.value = values.map((v) => v.value);
    onChange(newValue);
  };
  const selectedOptions = options.filter(
    (o) => value.value.indexOf(o.value) !== -1
  );
  return (
    <FormGroup>
      <Label className="attribute-label" style={{ marginBottom: "11px" }}>
        {label}
      </Label>
      <IntelligentTreeSelect
        id={id}
        options={options}
        value={selectedOptions}
        valueKey="value"
        labelKey="label"
        childrenKey="children"
        renderAsTree={renderAsTree}
        multi={true}
        simpleTreeData={true}
        showSettings={false}
        onChange={onSelect}
        classNamePrefix="react-select"
        placeholder=""
      />
    </FormGroup>
  );
};

export default MultiSelectFacet;
