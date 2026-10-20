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
import Utils from "../util/Utils";

export const CONTEXT = {
  ...ASSET_CONTEXT,
  title: context(VocabularyUtils.DC_TITLE),
  description: context(VocabularyUtils.DC_DESCRIPTION),
  vocabulary: VocabularyUtils.SKOS_IN_SCHEME,
};

export const UNORDERED_CONTEXT = {
  ...CONTEXT,
  members: VocabularyUtils.SKOS_MEMBER,
};

export const MEMBER_CONTEXT = {
  ...ASSET_CONTEXT,
  title: context(VocabularyUtils.DC_TITLE),
  label: context(VocabularyUtils.SKOS_PREF_LABEL),
};

export interface SkosCollectionDtoData extends HasIdentifier, HasTypes {
  title: MultilingualString;
  description?: MultilingualString;
  vocabulary: HasIdentifier;
}

export class SkosCollectionDto
  extends Asset
  implements SkosCollectionDtoData, HasLocalizableLabel
{
  public description?: MultilingualString;
  public title: MultilingualString;
  public vocabulary: HasIdentifier;

  constructor(data: SkosCollectionDtoData) {
    super(data);
    this.description = data.description;
    this.title = data.title;
    this.vocabulary = data.vocabulary;
    this.types = Utils.sanitizeArray(data.types);
  }

  getLabel(lang?: string): string {
    return getLocalized(this.title, lang);
  }

  public toJsonLd(): {} {
    return Object.assign({}, this, { "@context": this.getContext() });
  }

  protected getContext() {
    return CONTEXT;
  }

  /**
   * @return true when the collection has ordered collection type.
   */
  public isOrdered() {
    return this.hasType(VocabularyUtils.SKOS_ORDERED_COLLECTION);
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

export interface CollectionMember extends HasIdentifier {
  types: string[];
  label?: MultilingualString;
  title?: MultilingualString;
}

export function getMemberLabel(member: CollectionMember, shortLocale?: string) {
  if ("title" in member) {
    return getLocalized(member.title, shortLocale);
  }
  if ("label" in member) {
    return getLocalized(member.label, shortLocale);
  }
  return "";
}

export function isMemberCollection(member: CollectionMember) {
  return Utils.sanitizeArray(member.types).includes(
    VocabularyUtils.SKOS_COLLECTION
  );
}
