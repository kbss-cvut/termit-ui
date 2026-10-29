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
import { TermInfo } from "./Term";
import WithUnmappedProperties, {
  PropertyValuesType,
  stringifyPropertyValue,
} from "./WithUnmappedProperties";

export const CONTEXT = {
  ...ASSET_CONTEXT,
  title: context(VocabularyUtils.DC_TITLE),
  description: context(VocabularyUtils.DC_DESCRIPTION),
  vocabulary: VocabularyUtils.SKOS_IN_SCHEME,
};

export const MEMBER_CONTEXT = {
  ...ASSET_CONTEXT,
  title: context(VocabularyUtils.DC_TITLE),
  label: context(VocabularyUtils.SKOS_PREF_LABEL),
  vocabulary: VocabularyUtils.SKOS_IN_SCHEME,
};

export interface SkosCollectionData extends HasIdentifier, HasTypes {
  title: MultilingualString;
  description?: MultilingualString;
  vocabulary: HasIdentifier;
}

const MAPPED_PROPERTIES = ["@context", ...Object.keys(CONTEXT)];

export class SkosCollection
  extends Asset
  implements SkosCollectionData, HasLocalizableLabel
{
  public static readonly MULTILINGUAL_ATTRIBUTES = ["title", "description"];
  public description?: MultilingualString;
  public title: MultilingualString;
  public vocabulary: HasIdentifier;

  constructor(data: SkosCollectionData) {
    super(data);
    Object.assign(this, data);
    this.description = data.description;
    this.title = data.title;
    this.vocabulary = data.vocabulary;
    this.types = Utils.sanitizeArray(data.types);
    if (!this.types.includes(VocabularyUtils.SKOS_COLLECTION)) {
      this.types?.push(VocabularyUtils.SKOS_COLLECTION);
    }
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
    return isOrderedCollection(this);
  }

  public snapshotOf() {
    return this.unmappedProperties.has(
      VocabularyUtils.IS_SNAPSHOT_OF_COLLECTION
    )
      ? stringifyPropertyValue(
          this.unmappedProperties.get(
            VocabularyUtils.IS_SNAPSHOT_OF_COLLECTION
          )![0]
        )
      : undefined;
  }

  public isSnapshot() {
    return this.hasType(VocabularyUtils.COLLECTION_SNAPSHOT);
  }

  public isEditable(): boolean {
    return !this.isSnapshot();
  }

  public get unmappedProperties(): Map<string, PropertyValuesType> {
    return WithUnmappedProperties.getUnmappedProperties(
      this,
      MAPPED_PROPERTIES
    );
  }
}

export function isOrderedCollection(obj: HasTypes) {
  return obj.types?.includes(VocabularyUtils.SKOS_ORDERED_COLLECTION) || false;
}

export interface CollectionWithMembers<T extends Iterable<string>>
  extends SkosCollectionData {
  members: T;
}

export interface UnorderedCollectionData
  extends CollectionWithMembers<Set<string>> {}

export class UnorderedCollection
  extends SkosCollection
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
  extends SkosCollection
  implements OrderedCollectionData
{
  public members: Array<string>;
  constructor(data: OrderedCollectionData) {
    super(data);
    this.members = Array.from(data.members);
  }
}

export interface CollectionMemberData extends HasIdentifier {
  types: string[];
  /// term label
  label?: MultilingualString;
  /// collection title
  title?: MultilingualString;
  vocabulary: HasIdentifier;
}

export class CollectionMember
  implements CollectionMemberData, TermInfo, SkosCollectionData
{
  public readonly iri: string;
  public readonly types: string[];
  /// term label
  public readonly label: MultilingualString;
  /// collection title
  public readonly title: MultilingualString;
  public readonly vocabulary: HasIdentifier;

  constructor(data: CollectionMemberData) {
    this.iri = data.iri;
    this.types = Utils.sanitizeArray(data.types);
    this.label = data.label ?? {};
    this.title = data.title ?? {};
    this.vocabulary = data.vocabulary;
  }

  public getLabel(shortLocale?: string): string {
    if (this.isCollection()) {
      return getLocalized(this.title, shortLocale);
    } else {
      return getLocalized(this.label, shortLocale);
    }
  }

  public isCollection() {
    return isCollection(this);
  }
}

export function isCollection(memberData: HasTypes) {
  return (
    memberData.types?.includes(VocabularyUtils.SKOS_COLLECTION) ||
    isOrderedCollection(memberData) ||
    false
  );
}
