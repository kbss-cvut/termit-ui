import {
  context,
  MultilingualString,
  PluralMultilingualString,
} from "../MultilingualString";
import VocabularyUtils from "../../util/VocabularyUtils";
import { ASSET_CONTEXT, AssetData, HasIdentifier } from "../Asset";

const ctx = {
  label: context(VocabularyUtils.SKOS_PREF_LABEL),
  altLabels: context(VocabularyUtils.SKOS_ALT_LABEL),
  hiddenLabels: context(VocabularyUtils.SKOS_HIDDEN_LABEL),
  definition: context(VocabularyUtils.DEFINITION),
  scopeNote: context(VocabularyUtils.SKOS_SCOPE_NOTE),
  notations: VocabularyUtils.SKOS_NOTATION,
  examples: context(VocabularyUtils.SKOS_EXAMPLE),
  vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
  state: VocabularyUtils.HAS_TERM_STATE,
};

export const CONTEXT = { ...ctx, ...ASSET_CONTEXT };

export interface FacetedSearchResult extends AssetData {
  iri: string;
  types: string[] | string;
  label: MultilingualString;
  altLabels?: PluralMultilingualString;
  hiddenLabels?: PluralMultilingualString;
  scopeNote?: MultilingualString;
  definition?: MultilingualString;
  notations?: string[];
  examples?: PluralMultilingualString;
  vocabulary?: HasIdentifier;
  state?: HasIdentifier;
}
