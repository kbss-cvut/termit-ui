import OntologicalVocabulary from "../util/VocabularyUtils";
import VocabularyUtils from "../util/VocabularyUtils";
import Asset, { ASSET_CONTEXT, AssetData } from "./Asset";
import Document, {
  CONTEXT as DOCUMENT_CONTEXT,
  DocumentData,
} from "./Document";
import WithUnmappedProperties from "./WithUnmappedProperties";
import Utils from "../util/Utils";
import Constants from "../util/Constants";
import { SupportsSnapshots } from "./Snapshot";

// @id and @type are merged from ASSET_CONTEXT
const ctx = {
  label: VocabularyUtils.DC_TITLE,
  comment: VocabularyUtils.DC_DESCRIPTION,
  document: VocabularyUtils.DESCRIBES_DOCUMENT,
  glossary: VocabularyUtils.HAS_GLOSSARY,
  model: VocabularyUtils.HAS_MODEL,
  importedVocabularies: VocabularyUtils.IMPORTS_VOCABULARY,
};

export const CONTEXT = Object.assign({}, ASSET_CONTEXT, DOCUMENT_CONTEXT, ctx);

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
];

export interface VocabularyData extends AssetData {
  label: string;
  comment?: string;
  document?: DocumentData;
  glossary?: AssetData;
  model?: AssetData;
  importedVocabularies?: AssetData[];
}

export default class Vocabulary
  extends Asset
  implements VocabularyData, SupportsSnapshots
{
  public label: string;
  public comment?: string;
  public document?: Document;
  public glossary?: AssetData;
  public model?: AssetData;
  public importedVocabularies?: AssetData[];
  public allImportedVocabularies?: string[];

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
  }

  getLabel(): string {
    return this.label;
  }

  public toJsonLd(): VocabularyData {
    const result: VocabularyData = Object.assign({}, this, {
      "@context": CONTEXT,
    });
    delete (result as any).allImportedVocabularies;
    delete (result as any).termCount;
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
      ? this.unmappedProperties.get(
          VocabularyUtils.IS_SNAPSHOT_OF_VOCABULARY
        )![0]
      : undefined;
  }

  public snapshotCreated(): string | undefined {
    return this.unmappedProperties.has(VocabularyUtils.SNAPSHOT_CREATED)
      ? this.unmappedProperties.get(VocabularyUtils.SNAPSHOT_CREATED)![0]
      : undefined;
  }

  public get unmappedProperties(): Map<string, string[]> {
    return WithUnmappedProperties.getUnmappedProperties(
      this,
      MAPPED_PROPERTIES
    );
  }

  public set unmappedProperties(properties: Map<string, string[]>) {
    WithUnmappedProperties.setUnmappedProperties(
      this,
      properties,
      MAPPED_PROPERTIES
    );
  }
}

export const EMPTY_VOCABULARY = new Vocabulary({
  iri: Constants.EMPTY_ASSET_IRI,
  label: "",
});
