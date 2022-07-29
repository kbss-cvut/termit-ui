import Vocabulary from "../../model/Vocabulary";
import AssetLink from "../misc/AssetLink";
import { Routing, Vocabularies } from "../../util/Routing";
import { useI18n } from "../hook/useI18n";

interface VocabularyLinkProps {
  vocabulary: Vocabulary;
  id?: string;
}

const VocabularyLink = (props: VocabularyLinkProps) => {
  const { i18n } = useI18n();
  const { route, params, query } = Vocabularies.getVocabularyRoutingOptions(
    props.vocabulary
  );
  const path = Routing.getTransitionPath(route, { params, query });
  return (
    <AssetLink
      id={props.id}
      asset={props.vocabulary}
      path={path}
      tooltip={i18n("asset.link.tooltip")}
    />
  );
};

export default VocabularyLink;
