import React from "react";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { useI18n } from "../../hook/useI18n";
import Select from "../../misc/Select";

export type SelectorOption = {
  value: string;
  labelKey?: string;
  label?: string;
};

export const RANGE_OPTIONS: SelectorOption[] = [
  {
    value: VocabularyUtils.XSD_BOOLEAN,
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
    value: VocabularyUtils.XSD_STRING,
    labelKey: "datatype.string",
  },
];

export const DOMAIN_OPTIONS: SelectorOption[] = [
  {
    value: VocabularyUtils.TERM,
    labelKey: "type.term",
  },
  {
    value: VocabularyUtils.VOCABULARY,
    labelKey: "type.vocabulary",
  },
];

export function getSelectorOptionLabel(
  range: any,
  i18n: (key: string) => string
) {
  return range.labelKey ? i18n(range.labelKey) : range.label;
}

export const CustomAttributeSelector: React.FC<{
  value?: string;
  onChange: (value: string) => void;
  options: SelectorOption[];
  labelKey: string;
  disabled?: boolean;
}> = ({ value, onChange, options, labelKey, disabled }) => {
  const { i18n } = useI18n();

  return (
    <Select
      label={i18n(labelKey)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {getSelectorOptionLabel(option, i18n)}
        </option>
      ))}
    </Select>
  );
};
