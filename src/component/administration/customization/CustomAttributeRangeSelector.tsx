import React from "react";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { useI18n } from "../../hook/useI18n";
import Select from "../../misc/Select";

export const RANGE_OPTIONS = [
  {
    value: VocabularyUtils.NS_XSD + "boolean",
    label: "Boolean",
  },
  {
    value: VocabularyUtils.XSD_INT,
    labelKey: "datatype.integer",
  },
  {
    value: VocabularyUtils.TERM,
    labelKey: "type.term",
  },
  {
    value: VocabularyUtils.NS_XSD + "string",
    labelKey: "datatype.string",
  },
];

export function getRangeLabel(range: any, i18n: (key: string) => string) {
  return range.labelKey ? i18n(range.labelKey) : range.label;
}

export const CustomAttributeRangeSelector: React.FC<{
  value?: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const { i18n } = useI18n();

  return (
    <Select
      label={i18n("administration.customization.customProperties.range")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {RANGE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {getRangeLabel(option, i18n)}
        </option>
      ))}
    </Select>
  );
};
