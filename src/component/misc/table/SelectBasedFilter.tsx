import * as React from "react";
import { Input } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import { FilterFn } from "@tanstack/react-table";
import Utils from "../../../util/Utils";

export interface SelectFilterOption {
  value: string;
  label: string;
}

interface SelectBasedFilterProps {
  value: string;
  options: SelectFilterOption[];
  onChange: (value: string | undefined) => void;
}

/**
 * Filter function for select based filters.
 *
 * Returns true if the filterValue equals or is included in the row value (multi-value columns are supported). It is assumed that the type of the filter value and the row value are the compatible.
 * @param row Row to filter
 * @param columnId Column whose value to filter
 * @param filterValue Filter value
 */
export const selectFilter: FilterFn<any> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === null || filterValue === "") {
    return true;
  }
  return Utils.sanitizeArray(row.getValue<unknown>(columnId)).includes(
    filterValue
  );
};

const SelectBasedFilter: React.FC<SelectBasedFilterProps> = ({
  value,
  options,
  onChange,
}) => {
  const { i18n } = useI18n();
  return (
    <Input
      bsSize="sm"
      type="select"
      className="mt-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{i18n("table.filter.select.all")}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Input>
  );
};

export default SelectBasedFilter;
