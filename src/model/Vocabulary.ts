import OntologicalVocabulary from "../util/VocabularyUtils";
import VocabularyUtils from "../util/VocabularyUtils";
import Asset, { ASSET_CONTEXT, AssetData, Editable } from "./Asset";
import Document, {
  CONTEXT as DOCUMENT_CONTEXT,
  DocumentData,
} from "./Document";
import WithUnmappedProperties, {
  HasUnmappedProperties,
  PropertyValueType,
  stringifyPropertyValue,
} from "./WithUnmappedProperties";
import Utils from "../util/Utils";
import Constants from "../util/Constants";
import { SupportsSnapshots } from "./Snapshot";
import JsonLdUtils from "../util/JsonLdUtils";
import AccessLevel, { strToAccessLevel } from "./acl/AccessLevel";
import { getLanguages, removeTranslation } from "../util/IntlUtil";
import {
  context,
  getLocalized,
  langString,
  MultilingualString,
} from "./MultilingualString";

// @id and @type are merged from ASSET_CONTEXT
const ctx = {
  label: context(VocabularyUtils.DC_TITLE),
  comment: context(VocabularyUtils.DC_DESCRIPTION),
  document: {
    "@id": VocabularyUtils.DESCRIBES_DOCUMENT,
    "@context": DOCUMENT_CONTEXT,
  },
  glossary: VocabularyUtils.HAS_GLOSSARY,
  model: VocabularyUtils.HAS_MODEL,
  importedVocabularies: VocabularyUtils.IMPORTS_VOCABULARY,
  accessLevel: JsonLdUtils.idContext(VocabularyUtils.HAS_ACCESS_LEVEL),
};

export const CONTEXT = Object.assign({}, ASSET_CONTEXT, ctx);

const MAPPED_PROPERTIES = [
  "@context",
  "iri",
  "label",
  "comment",
  "document",
  "types",
  "glossary",
  "model",
  "importedVocabularies",
  "allImportedVocabularies",
  "termCount",
  "accessLevel",
];

export const VOCABULARY_MULTILINGUAL_ATTRIBUTES = ["label", "comment"];

export interface VocabularyData extends AssetData {
  label: MultilingualString;
  comment?: MultilingualString;
  document?: DocumentData;
  glossary?: AssetData;
  model?: AssetData;
  importedVocabularies?: AssetData[];
  accessLevel?: AccessLevel;
}

export default class Vocabulary
  extends Asset
  implements Editable, VocabularyData, SupportsSnapshots, HasUnmappedProperties
{
  public label: MultilingualString;
  public comment?: MultilingualString;
  public document?: Document;
  public glossary?: AssetData;
  public model?: AssetData;
  public importedVocabularies?: AssetData[];
  public allImportedVocabularies?: string[];
  public accessLevel?: AccessLevel;

  public termCount?: number;

  constructor(data: VocabularyData) {
    super(data);
    Object.assign(this, data);
    this.label = data.label;
    this.types = Utils.sanitizeArray(data.types);
    if (this.types.indexOf(OntologicalVocabulary.VOCABULARY) === -1) {
      this.types.push(OntologicalVocabulary.VOCABULARY);
    }
    if (data.document) {
      this.document = new Document(data.document);
    }
    this.accessLevel = data.accessLevel
      ? strToAccessLevel(data.accessLevel)
      : undefined;
  }

  getLabel(lang?: string): string {
    return getLocalized(this.label, lang);
  }

  public toJsonLd(): VocabularyData {
    const result: VocabularyData = Object.assign({}, this, {
      "@context": CONTEXT,
    });
    delete (result as any).allImportedVocabularies;
    delete (result as any).termCount;
    delete (result as any).accessLevel;
    if (result.document) {
      result.document = this.document?.toJsonLd();
    }
    return result;
  }

  public isSnapshot(): boolean {
    return this.hasType(VocabularyUtils.VOCABULARY_SNAPSHOT);
  }

  public snapshotOf(): string | undefined {
    return this.unmappedProperties.has(
      VocabularyUtils.IS_SNAPSHOT_OF_VOCABULARY
    )
      ? stringifyPropertyValue(
          this.unmappedProperties.get(
            VocabularyUtils.IS_SNAPSHOT_OF_VOCABULARY
          )![0]
        )
      : undefined;
  }

  public snapshotCreated(): string | undefined {
    return this.unmappedProperties.has(VocabularyUtils.SNAPSHOT_CREATED)
      ? stringifyPropertyValue(
          this.unmappedProperties.get(VocabularyUtils.SNAPSHOT_CREATED)![0]
        )
      : undefined;
  }

  public isEditable(): boolean {
    return !this.isSnapshot() && !this.hasType(VocabularyUtils.IS_READ_ONLY);
  }

  public get unmappedProperties(): Map<string, PropertyValueType[]> {
    return WithUnmappedProperties.getUnmappedProperties(
      this,
      MAPPED_PROPERTIES
    );
  }

  public set unmappedProperties(properties: Map<string, PropertyValueType[]>) {
    WithUnmappedProperties.setUnmappedProperties(
      this,
      properties,
      MAPPED_PROPERTIES
    );
  }

  public static removeTranslation(data: VocabularyData, lang: string) {
    removeTranslation(VOCABULARY_MULTILINGUAL_ATTRIBUTES, data, lang);
  }

  public static getLanguages(vocabulary?: VocabularyData | null): string[] {
    return getLanguages(VOCABULARY_MULTILINGUAL_ATTRIBUTES, vocabulary);
  }
}

export const EMPTY_VOCABULARY = new Vocabulary({
  iri: Constants.EMPTY_ASSET_IRI,
  label: langString(""),
});
