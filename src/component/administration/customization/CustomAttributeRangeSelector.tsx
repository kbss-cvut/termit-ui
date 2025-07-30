import React from "react";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { useI18n } from "../../hook/useI18n";
import Select from "../../misc/Select";

const RANGE_OPTIONS = [
  {
    value: VocabularyUtils.NS_XSD + "boolean",
    label: "Boolean",
  },
  {
    value: VocabularyUtils.XSD_INT,
    label: "Integer",
  },
  {
    value: VocabularyUtils.TERM,
    labelKey: "type.term",
  },
  {
    value: VocabularyUtils.NS_XSD + "string",
    label: "String",
  },
];

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
          {option.labelKey ? i18n(option.labelKey) : option.label}
        </option>
      ))}
    </Select>
  );
};
