import React from "react";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { AssetData } from "../../model/Asset";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import { useI18n } from "../hook/useI18n";
import RdfsResource, { RdfsResourceData } from "../../model/RdfsResource";
import Utils from "../../util/Utils";

interface TermStateSelectorProps {
  value?: AssetData;
  onChange: (iri: string) => void;
}

const TermStateSelector: React.FC<TermStateSelectorProps> = ({
  value,
  onChange,
}) => {
  const { locale } = useI18n();
  const states = useSelector((state: TermItState) => state.states);
  const options = Utils.mapToArray(states);
  const onSelect = (item: RdfsResource) => {
    onChange(item.iri);
  };

  return (
    <IntelligentTreeSelect
      id="term-state-selector"
      onChange={onSelect}
      options={options}
      value={value ? states[value.iri!] : undefined}
      valueKey="iri"
      getOptionLabel={(option: RdfsResourceData) =>
        getLocalized(option.label, getShortLocale(locale))
      }
      valueRenderer={Utils.simpleValueRenderer}
      showSettings={false}
      maxHeight={150}
      multi={false}
      displayInfoOnHover={true}
      expanded={true}
      renderAsTree={false}
      placeholder=""
      classNamePrefix="react-select"
      isClearable={false}
    />
  );
};

export default TermStateSelector;
