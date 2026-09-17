import React from "react";
import SearchParam from "../../../model/search/SearchParam";
import { FormGroup, Label } from "reactstrap";
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
  const onSelect = (values: readonly SelectOption[]) => {
    const newValue = Object.assign({}, value);
    newValue.value = values.map((v) => v.value);
    onChange(newValue);
  };
  const selectedOptions = options.filter(
    (o) => value.value.indexOf(o.value) !== -1
  );
  return (
    <FormGroup>
      <div className="d-flex justify-content-between align-items-end mb-2">
        <Label className="attribute-label mb-0">{label}</Label>
      </div>
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
        onChange={onSelect}
        classNamePrefix="react-select"
        placeholder=""
      />
    </FormGroup>
  );
};

export default MultiSelectFacet;
