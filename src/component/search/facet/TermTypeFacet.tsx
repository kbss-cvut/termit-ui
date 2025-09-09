import React from "react";
import SearchParam from "../../../model/search/SearchParam";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { ThunkDispatch } from "../../../util/Types";
import { loadTypes } from "../../../action/AsyncActions";
import MultiSelectFacet from "./MultiSelectFacet";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";
import { mapTypeOptions } from "../../misc/treeselect/OptionMappers";

interface TermTypeFacetProps {
  value: SearchParam;
  onChange: (newValue: SearchParam) => void;
}

const TermTypeFacet: React.FC<TermTypeFacetProps> = ({ value, onChange }) => {
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadTypes());
  }, [dispatch]);
  const types = useSelector((state: TermItState) => state.types);
  const { i18n, locale } = useI18n();
  const typeOptions = React.useMemo(
    () =>
      mapTypeOptions(types).map((r) => ({
        value: r.iri,
        label: getLocalized(r.label, locale),
        children: r.plainSubTerms,
        parent: r.parent,
      })),
    [types, locale]
  );
  return (
    <MultiSelectFacet
      id="faceted-search-type"
      label={i18n("term.metadata.types")}
      value={value}
      onChange={onChange}
      options={typeOptions}
      renderAsTree={true}
    />
  );
};

export default TermTypeFacet;
