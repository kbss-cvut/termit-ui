import { AssetData, HasLabel } from "./Asset";
import Utils from "../util/Utils";
import VocabularyUtils from "../util/VocabularyUtils";
import MultilingualString, {
  context,
  getLocalized,
} from "./MultilingualString";

export const CONTEXT = {
  iri: "@id",
  label: context(VocabularyUtils.RDFS_LABEL),
  comment: context(VocabularyUtils.RDFS_COMMENT),
  types: "@type",
};

export interface RdfsResourceData extends AssetData {
  iri: string;
  label?: MultilingualString;
  comment?: MultilingualString;
  types?: string[];
}

/**
 * Represents a generic RDFS resource.
 */
export default class RdfsResource implements RdfsResourceData, HasLabel {
  public readonly iri: string;
  public readonly label?: MultilingualString;
  public readonly comment?: MultilingualString;
  public readonly types: string[];

  constructor(data: RdfsResourceData) {
    this.iri = data.iri;
    this.label = data.label;
    this.comment = data.comment;
    this.types = Utils.sanitizeArray(data.types);
    if (this.types.indexOf(VocabularyUtils.RDFS_RESOURCE) === -1) {
      this.types.push(VocabularyUtils.RDFS_RESOURCE);
    }
  }

  getLabel(lang?: string): string {
    return getLocalized(this.label, lang);
  }

  public toJsonLd() {
    return Object.assign({}, this, { "@context": CONTEXT });
  }
}
