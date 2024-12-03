import React from "react";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { getLanguageOptions, Language } from "../../../util/IntlUtil";
import { useI18n } from "../../hook/useI18n";

const LanguageSelector: React.FC<{
  onChange: (lang: string) => void;
  value: string;
}> = ({ onChange, value }) => {
  const options = getLanguageOptions();
  const { i18n } = useI18n();
  return (
    <IntelligentTreeSelect
      onChange={(item: Language) => onChange(item.code)}
      options={options}
      maxHeight={200}
      multi={false}
      labelKey="nativeName"
      valueKey="code"
      classNamePrefix="react-select"
      simpleTreeData={true}
      renderAsTree={false}
      showSettings={false}
      isClearable={false}
      placeholder=""
      noResultsText={i18n("search.no-results")}
      value={options.find((o) => o.code === value)}
    />
  );
};

export default LanguageSelector;
