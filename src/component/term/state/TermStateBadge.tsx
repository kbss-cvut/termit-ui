import React from "react";
import { HasIdentifier } from "../../../model/Asset";
import { useI18n } from "../../hook/useI18n";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { Badge } from "reactstrap";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";

const TermStateBadge: React.FC<{ state?: HasIdentifier }> = ({ state }) => {
  const { locale } = useI18n();
  const states = useSelector((state: TermItState) => state.states);
  const selectedState = state ? states[state.iri] : undefined;

  return selectedState ? (
    <Badge color="light" className="align-text-bottom">
      {getLocalized(selectedState.label, getShortLocale(locale))}
    </Badge>
  ) : null;
};

export default TermStateBadge;
