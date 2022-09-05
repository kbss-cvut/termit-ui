import * as React from "react";
import AssetLink from "../misc/AssetLink";
import Term, { TermInfo } from "../../model/Term";
import OutgoingLink from "../misc/OutgoingLink";
import User from "../../model/User";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { Routing, Terms } from "../../util/Routing";
import Routes from "../../util/Routes";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import { useI18n } from "../hook/useI18n";

interface TermLinkProps {
  term: Term | TermInfo;
  id?: string;
  language?: string;
  activeTab?: string;
}

export function getTermPath(term: Term | TermInfo, user?: User | null) {
  return getTermPathWithTab(term, user, undefined);
}

function getTermPathWithTab(
  term: Term | TermInfo,
  user?: User | null,
  activeTab?: string
) {
  if (!term.vocabulary) {
    return Routing.getTransitionPath(Routes.dashboard);
  }
  const { route, params, query } = Terms.getTermRoutingOptions(term);
  if (activeTab) {
    query.set("activeTab", activeTab);
  }
  return Routing.getTransitionPath(route, { params, query });
}

export const TermLink: React.FC<TermLinkProps> = (props) => {
  const { term, id, language } = props;
  const user = useSelector((state: TermItState) => state.user);
  const { i18n, locale } = useI18n();
  const label = getLocalized(
    term.label,
    language ? language : getShortLocale(locale)
  );
  if (!term.vocabulary) {
    // This can happen e.g. when FTS returns a term in the predefined language used for term types
    return <OutgoingLink label={label} iri={term.iri} />;
  }
  const path = getTermPathWithTab(term, user, props.activeTab);
  // Make a copy of the term with a simple localized label for the AssetLink component
  const t = Object.assign({}, term, { label });

  return (
    <AssetLink
      id={id}
      asset={t}
      path={path}
      tooltip={i18n("asset.link.tooltip")}
    />
  );
};

export default TermLink;
