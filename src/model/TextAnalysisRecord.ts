import { CONTEXT as RESOURCE_CONTEXT, ResourceData } from "./Resource";
import { AssetData } from "./Asset";
import Utils from "../util/Utils";
import VocabularyUtils from "../util/VocabularyUtils";

const ctx = {
  vocabularies: `${VocabularyUtils.NS_TERMIT}m\u00e1-slovn\u00edk-pro-anal\u00fdzu`,
  analyzedResource: `${VocabularyUtils.NS_TERMIT}m\u00e1-analyzovan\u00fd-zdroj`,
  language: VocabularyUtils.DC_LANGUAGE,
};

export const CONTEXT = Object.assign({}, ctx, RESOURCE_CONTEXT);

export interface TextAnalysisRecordData {
  iri: string;
  analyzedResource: ResourceData;
  vocabularies: AssetData[];
  created: string;
  language?: string;
}

export class TextAnalysisRecord implements TextAnalysisRecordData {
  public readonly iri: string;
  public readonly analyzedResource: ResourceData;
  public readonly vocabularies: AssetData[];
  public readonly created: string;
  public readonly language?: string;

  constructor(data: TextAnalysisRecordData) {
    this.iri = data.iri;
    this.analyzedResource = data.analyzedResource;
    this.created = data.created;
    this.language = data.language;
    this.vocabularies = Utils.sanitizeArray(data.vocabularies);
  }
}
