import Vocabulary from "../../model/Vocabulary";
import AssetLink from "../misc/AssetLink";
import { Routing, Vocabularies } from "../../util/Routing";
import { useI18n } from "../hook/useI18n";
import { getLocalized } from "../../model/MultilingualString";
import React from "react";
import { getShortLocale } from "../../util/IntlUtil";

interface VocabularyLinkProps {
  vocabulary: Vocabulary;
  id?: string;
  className?: string;
  language?: string;
}

const VocabularyLink: React.FC<VocabularyLinkProps> = ({
  vocabulary,
  id,
  className,
  language,
}) => {
  const { i18n, locale } = useI18n();
  const { route, params, query } =
    Vocabularies.getVocabularyRoutingOptions(vocabulary);
  const label = getLocalized(
    vocabulary.label,
    language ? language : getShortLocale(locale)
  );
  const path = Routing.getTransitionPath(route, { params, query });
  const asset = {
    label,
    iri: vocabulary.iri,
  };
  return (
    <AssetLink
      id={id}
      asset={asset}
      path={path}
      tooltip={i18n("asset.link.tooltip")}
      className={className}
    />
  );
};

export default VocabularyLink;
