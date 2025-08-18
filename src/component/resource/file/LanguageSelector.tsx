import React from "react";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { getLanguageOptions, Language } from "../../../util/IntlUtil";
import { useI18n } from "../../hook/useI18n";

const LanguageSelector: React.FC<{
  onChange: (lang: string) => void;
  value: string;
  className?: string;
  isClearable?: boolean;
  languageOptions?: Language[];
}> = ({ onChange, value, className, isClearable = false, languageOptions }) => {
  const options = languageOptions || getLanguageOptions();
  const { i18n } = useI18n();
  return (
    <IntelligentTreeSelect
      className={className}
      onChange={(item: Language) => onChange(item?.code || "")}
      options={options}
      maxHeight={200}
      multi={false}
      labelKey="nativeName"
      valueKey="code"
      classNamePrefix="react-select"
      simpleTreeData={true}
      renderAsTree={false}
      showSettings={false}
      isClearable={isClearable}
      placeholder=""
      noResultsText={i18n("search.no-results")}
      value={options.find((o) => o.code === value)}
    />
  );
};

export default LanguageSelector;
