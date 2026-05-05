import * as React from "react";
import { Input } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";
import Utils from "../../../util/Utils";
import { FilterFn, Row, RowData } from "@tanstack/react-table";

interface TextBasedFilterProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export const textContainsFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue
) => {
  const normalizedFilterValue = Utils.normalizeString(
    String(filterValue)
  ).toLowerCase();
  const rowValue = row.getValue<unknown>(columnId);

  return rowValue !== undefined
    ? textContains(String(rowValue), normalizedFilterValue)
    : true;
};

function textContains(text: string, toContain: string) {
  return (
    Utils.normalizeString(String(text).toLowerCase()).indexOf(toContain) !== -1
  );
}

const isLocalizableValue = (
  value: unknown
): value is Parameters<typeof getLocalized>[0] =>
  typeof value === "object" && value !== null;

export function multilingualTextContainsFilterFactory<
  TData extends RowData = RowData
>(lang: string): FilterFn<TData> {
  return (row: Row<TData>, columnId: string, filterValue: unknown) => {
    const normalizedFilterValue = Utils.normalizeString(
      String(filterValue)
    ).toLowerCase();
    const rowValue = row.getValue<unknown>(columnId);

    if (rowValue === undefined) {
      return true;
    }

    const toMatch = isLocalizableValue(rowValue)
      ? getLocalized(rowValue, lang)
      : String(rowValue);
    return textContains(String(toMatch), normalizedFilterValue);
  };
}

const TextBasedFilter: React.FC<TextBasedFilterProps> = ({
  value,
  onChange,
}) => {
  const { formatMessage } = useI18n();
  return (
    <Input
      bsSize="sm"
      className="mt-1"
      value={value}
      onChange={(e) => onChange(e.target.value || undefined)}
      placeholder={formatMessage("table.filter.text.placeholder", { count: 0 })}
    />
  );
};

export default TextBasedFilter;
