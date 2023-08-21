import React from "react";
import SearchParam from "../../../model/search/SearchParam";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import { loadTermStates } from "../../../action/AsyncActions";
import TermItState from "../../../model/TermItState";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";
import MultiSelectFacet from "./MultiSelectFacet";

interface TermStateFacetProps {
  value: SearchParam;
  onChange: (newValue: SearchParam) => void;
}

const TermStateFacet: React.FC<TermStateFacetProps> = ({ value, onChange }) => {
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadTermStates());
  }, [dispatch]);
  const states = useSelector((state: TermItState) => state.states);
  const { i18n, locale } = useI18n();
  const typeOptions = React.useMemo(
    () =>
      Object.entries(states).map((e) => ({
        value: e[1].iri,
        label: getLocalized(e[1].label, locale),
      })),
    [states, locale]
  );
  return (
    <MultiSelectFacet
      id="faceted-search-state"
      label={i18n("term.metadata.status")}
      value={value}
      onChange={onChange}
      options={typeOptions}
      renderAsTree={false}
    />
  );
};

export default TermStateFacet;
