import React from "react";
import SearchParam from "../../../model/search/SearchParam";
import { useI18n } from "../../hook/useI18n";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { Col } from "reactstrap";
import { RdfProperty } from "src/model/RdfsResource";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { BooleanFacet } from "./BooleanFacet";
import Utils from "../../../util/Utils";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import { TermSelectorFacet } from "./TermSelectorFacet";
import TextFacet from "./TextFacet";
import { ThunkDispatch } from "../../../util/Types";
import { getCustomAttributes } from "../../../action/AsyncActions";
import { NumberFacet } from "./NumberFacet";
import { createSearchParam } from "./FacetedSearchUtil";

export const CustomAttributeFacets: React.FC<{
  values: { [key: string]: SearchParam };
  onChange: (value: SearchParam) => void;
  allowedIris?: string[];
  xl?: number;
  md?: number;
  xs?: number;
}> = ({ values, onChange, allowedIris = [], xl = 4, md = 6, xs = 12 }) => {
  const { locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  React.useEffect(() => {
    dispatch(getCustomAttributes());
  }, [dispatch]);
  const lang = getShortLocale(locale);

  const content = customAttributes
    .filter((att) => att.domainIri === VocabularyUtils.TERM)
    .filter((att) => allowedIris.includes(att.iri))
    .map((att) => (
      <Col key={att.iri} xl={xl} md={md} xs={xs} className="mb-3">
        {renderFacet(
          att,
          values[att.iri] || createSearchParam(att),
          onChange,
          lang
        )}
      </Col>
    ));
  return <>{content}</>;
};

function renderFacet(
  att: RdfProperty,
  value: SearchParam,
  onChange: (value: SearchParam, debounce?: boolean) => void,
  lang: string
) {
  const hashCode = Utils.hashCode(att.iri).toString();
  switch (att.rangeIri) {
    case VocabularyUtils.XSD_BOOLEAN:
      return (
        <BooleanFacet
          id={hashCode}
          key={hashCode}
          label={getLocalized(att.label, lang)}
          value={value}
          onChange={onChange}
        />
      );
    case VocabularyUtils.TERM:
      return (
        <TermSelectorFacet
          id={hashCode}
          key={hashCode}
          label={getLocalized(att.label, lang)}
          value={value}
          onChange={onChange}
        />
      );
    case VocabularyUtils.XSD_STRING:
      return (
        <TextFacet
          id={hashCode}
          key={hashCode}
          label={getLocalized(att.label, lang)}
          value={value}
          onChange={onChange}
        />
      );
    case VocabularyUtils.XSD_INT:
      return (
        <NumberFacet
          id={hashCode}
          label={getLocalized(att.label, lang)}
          value={value}
          onChange={onChange}
        />
      );
    case VocabularyUtils.RDFS_RESOURCE:
      return (
        <TextFacet
          id={hashCode}
          key={hashCode}
          label={getLocalized(att.label, lang)}
          value={value}
          onChange={(v) => onChange(v, true)}
        />
      );
    default:
      return null;
  }
}
