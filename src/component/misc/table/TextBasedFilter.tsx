import * as React from "react";
import { Input } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";

interface TextBasedFilterProps {
  column: {
    filterValue?: string;
    setFilter: (value?: string) => void;
    preFilteredRows: any[];
  };
}

export function textContainsFilter(
  rows: any[],
  id: string,
  filterValue?: string
) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue !== undefined
      ? String(rowValue)
          .toLowerCase()
          .indexOf(String(filterValue).toLowerCase()) !== -1
      : true;
  });
}

export function multilingualTextContainsFilterFactory(lang: string) {
  return (rows: any[], id: string, filterValue?: string) => {
    return rows.filter((row) => {
      const rowValue = row.values[id];
      if (rowValue === undefined) {
        return true;
      }
      let toMatch = rowValue;
      if (typeof rowValue === "object") {
        toMatch = getLocalized(rowValue, lang);
      }
      return (
        toMatch.toLowerCase().indexOf(String(filterValue).toLowerCase()) !== -1
      );
    });
  };
}

const TextBasedFilter: React.FC<TextBasedFilterProps> = (props) => {
  const { filterValue, setFilter, preFilteredRows } = props.column;
  const { formatMessage } = useI18n();
  const count = preFilteredRows.length;
  return (
    <Input
      bsSize="sm"
      className="mt-1"
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={formatMessage("table.filter.text.placeholder", { count })}
    />
  );
};

export default TextBasedFilter;
