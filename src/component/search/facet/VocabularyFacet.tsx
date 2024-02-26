import React from "react";
import SearchParam from "../../../model/search/SearchParam";
import { useI18n } from "../../hook/useI18n";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import { loadVocabularies } from "../../../action/AsyncActions";
import TermItState from "../../../model/TermItState";
import MultiSelectFacet from "./MultiSelectFacet";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";

interface VocabularyFacetProps {
  value: SearchParam;
  onChange: (newValue: SearchParam) => void;
}

const VocabularyFacet: React.FC<VocabularyFacetProps> = ({
  value,
  onChange,
}) => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadVocabularies());
  }, [dispatch]);
  const vocabularies = useSelector((state: TermItState) => state.vocabularies);
  const vocabularyOptions = React.useMemo(
    () =>
      Object.keys(vocabularies).map((v) => ({
        value: vocabularies[v].iri,
        label: getLocalized(vocabularies[v].label, getShortLocale(locale)),
      })),
    [vocabularies]
  );

  return (
    <MultiSelectFacet
      id="faceted-search-vocabulary"
      label={i18n("type.vocabulary")}
      value={value}
      onChange={onChange}
      options={vocabularyOptions}
    />
  );
};

export default VocabularyFacet;
