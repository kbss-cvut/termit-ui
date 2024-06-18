import * as React from "react";
import { Input } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";
import Utils from "../../../util/Utils";

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
  filterValue: string
) {
  const normalizedFilterValue = Utils.normalizeString(
    String(filterValue)
  ).toLowerCase();
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue !== undefined
      ? textContains(rowValue, normalizedFilterValue)
      : true;
  });
}

function textContains(text: string, toContain: string) {
  return (
    Utils.normalizeString(String(text).toLowerCase()).indexOf(toContain) !== -1
  );
}

export function multilingualTextContainsFilterFactory(lang: string) {
  return (rows: any[], id: string, filterValue?: string) => {
    const normalizedFilterValue = Utils.normalizeString(
      String(filterValue)
    ).toLowerCase();
    return rows.filter((row) => {
      const rowValue = row.values[id];
      if (rowValue === undefined) {
        return true;
      }
      let toMatch = rowValue;
      if (typeof rowValue === "object") {
        toMatch = getLocalized(rowValue, lang);
      }
      return textContains(toMatch, normalizedFilterValue);
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
