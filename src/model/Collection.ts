import Asset, {
  ASSET_CONTEXT,
  HasIdentifier,
  HasLocalizableLabel,
  HasTypes,
} from "./Asset";
import {
  context,
  getLocalized,
  MultilingualString,
} from "./MultilingualString";
import VocabularyUtils from "../util/VocabularyUtils";

export const CONTEXT = {
  ...ASSET_CONTEXT,
  label: context(VocabularyUtils.DC_TITLE),
  description: context(VocabularyUtils.DC_DESCRIPTION),
  vocabulary: VocabularyUtils.SKOS_IN_SCHEME,
};

export const UNORDERED_CONTEXT = {
  ...CONTEXT,
  members: VocabularyUtils.SKOS_MEMBER,
};

export interface SkosCollectionDtoData extends HasIdentifier, HasTypes {
  label: MultilingualString;
  description?: MultilingualString;
  vocabulary: string;
}

export class SkosCollectionDto
  extends Asset
  implements SkosCollectionDtoData, HasLocalizableLabel
{
  public description?: MultilingualString;
  public label: MultilingualString;
  public vocabulary: string;

  constructor(data: SkosCollectionDtoData) {
    super(data);
    this.description = data.description;
    this.label = data.label;
    this.vocabulary = data.vocabulary;
  }

  getLabel(lang?: string): string {
    return getLocalized(this.label, lang);
  }

  public toJsonLd(): {} {
    return Object.assign({}, this, { "@context": this.getContext() });
  }

  protected getContext() {
    return CONTEXT;
  }
}

export interface CollectionWithMembers<T extends Iterable<string>>
  extends SkosCollectionDtoData {
  members: T;
}

export interface UnorderedCollectionData
  extends CollectionWithMembers<Set<string>> {}

export class UnorderedCollection
  extends SkosCollectionDto
  implements UnorderedCollectionData
{
  public members: Set<string>;

  constructor(data: UnorderedCollectionData) {
    super(data);
    this.members = new Set(data.members);
  }
}

export interface OrderedCollectionData
  extends CollectionWithMembers<Array<string>> {
  members: Array<string>;
}

export class OrderedCollection
  extends SkosCollectionDto
  implements OrderedCollectionData
{
  public members: Array<string>;
  constructor(data: OrderedCollectionData) {
    super(data);
    this.members = Array.from(data.members);
  }
}
