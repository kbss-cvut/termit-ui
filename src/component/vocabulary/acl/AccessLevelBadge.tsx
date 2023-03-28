import React from "react";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";

function stripLabel(label: string) {
  return label.substring(label.indexOf("-") + 1).trim();
}

const AccessLevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const levels = useSelector((state: TermItState) => state.accessLevels);
  const { locale } = useI18n();
  const matchingResource = levels[level];
  return matchingResource ? (
    <div
      className="font-weight-bold"
      title={getLocalized(matchingResource.comment, locale)}
    >
      {stripLabel(getLocalized(matchingResource.label, locale))}
    </div>
  ) : (
    <>{level}</>
  );
};

export default AccessLevelBadge;
