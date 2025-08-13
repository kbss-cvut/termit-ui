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
  domain: VocabularyUtils.RDFS_DOMAIN,
  range: VocabularyUtils.RDFS_RANGE,
  types: "@type",
};

export interface RdfsResourceData extends AssetData {
  iri: string;
  label?: MultilingualString;
  comment?: MultilingualString;
  types?: string[];
}

export interface RdfPropertyData extends RdfsResourceData {
  domain?: string;
  range?: string | { iri: string };
}

/**
 * Represents a generic RDFS resource.
 */
export default class RdfsResource implements RdfsResourceData, HasLabel {
  public iri: string;
  public label?: MultilingualString;
  public comment?: MultilingualString;
  public types: string[];

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

export class RdfProperty extends RdfsResource {
  public domain?: string | { iri: string };
  public range?: string | { iri: string };

  constructor(data: RdfPropertyData) {
    super(data);
    this.domain = data.domain;
    this.range = data.range;
  }

  public get domainIri(): string {
    if (typeof this.domain === "string") {
      return this.domain;
    }
    return this.domain?.iri || "";
  }

  public get rangeIri(): string {
    if (typeof this.range === "string") {
      return this.range;
    }
    return this.range?.iri || "";
  }
}

export class CreateRdfPropertyData {
  public label?: MultilingualString;
  public comment?: MultilingualString;
  public types: string[];
  public domain?: string;
  public range?: string;

  constructor(data: {
    label: MultilingualString;
    comment?: MultilingualString;
    domain?: string;
    range?: string;
  }) {
    this.label = data.label;
    this.comment = data.comment;
    this.domain = data.domain;
    this.range = data.range;
    this.types = [VocabularyUtils.NS_TERMIT + "vlastní-atribut"];
  }

  public toJsonLd() {
    return Object.assign({}, this, { "@context": CONTEXT });
  }
}
