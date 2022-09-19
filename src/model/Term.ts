import { ASSET_CONTEXT, AssetData, default as Asset } from "./Asset";
import Utils from "../util/Utils";
import WithUnmappedProperties from "./WithUnmappedProperties";
import VocabularyUtils from "../util/VocabularyUtils";
import * as _ from "lodash";
import {
  BASE_CONTEXT as BASE_OCCURRENCE_CONTEXT,
  TermOccurrenceData,
} from "./TermOccurrence";
import MultilingualString, {
  context,
  getLocalized,
  PluralMultilingualString,
} from "./MultilingualString";
import { SupportsSnapshots } from "./Snapshot";

const ctx = {
  label: context(VocabularyUtils.SKOS_PREF_LABEL),
  altLabels: context(VocabularyUtils.SKOS_ALT_LABEL),
  hiddenLabels: context(VocabularyUtils.SKOS_HIDDEN_LABEL),
  definition: context(VocabularyUtils.DEFINITION),
  scopeNote: context(VocabularyUtils.SKOS_SCOPE_NOTE),
  parentTerms: VocabularyUtils.BROADER,
  exactMatchTerms: VocabularyUtils.SKOS_EXACT_MATCH,
  relatedTerms: VocabularyUtils.SKOS_RELATED,
  relatedMatchTerms: VocabularyUtils.SKOS_RELATED_MATCH,
  subTerms: VocabularyUtils.NARROWER,
  sources: VocabularyUtils.DC_SOURCE,
  vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
  definitionSource: VocabularyUtils.HAS_DEFINITION_SOURCE,
  draft: VocabularyUtils.IS_DRAFT,
  glossary: VocabularyUtils.SKOS_IN_SCHEME,
  types: "@type",
};

export const CONTEXT = Object.assign(
  ctx,
  ASSET_CONTEXT,
  BASE_OCCURRENCE_CONTEXT
);

const MAPPED_PROPERTIES = [
  "@context",
  "iri",
  "label",
  "altLabels",
  "hiddenLabels",
  "scopeNote",
  "definition",
  "subTerms",
  "sources",
  "types",
  "parentTerms",
  "parent",
  "relatedTerms",
  "relatedMatchTerms",
  "plainSubTerms",
  "vocabulary",
  "glossary",
  "definitionSource",
  "draft",
  "exactMatchTerms",
];

export const TERM_MULTILINGUAL_ATTRIBUTES = [
  "label",
  "definition",
  "scopeNote",
  "altLabels",
  "hiddenLabels",
];

export interface TermData extends AssetData {
  label: MultilingualString;
  altLabels?: PluralMultilingualString;
  hiddenLabels?: PluralMultilingualString;
  scopeNote?: MultilingualString;
  definition?: MultilingualString;
  exactMatchTerms?: TermInfo[];
  relatedTerms?: TermInfo[];
  relatedMatchTerms?: TermInfo[];
  subTerms?: TermInfo[];
  sources?: string[];
  // Represents proper parent Term, stripped of broader terms representing other model relationships
  parentTerms?: TermData[];
  parent?: string; // Introduced in order to support the Intelligent Tree Select component
  plainSubTerms?: string[]; // Introduced in order to support the Intelligent Tree Select component
  vocabulary?: AssetData;
  definitionSource?: TermOccurrenceData;
  draft?: boolean;
}

export interface TermInfo {
  iri: string;
  label: MultilingualString; // Multilingual string due to the same context item (see ctx above)
  vocabulary: AssetData;
  types?: string[];
}

export function termComparator(a: TermInfo | TermData, b: TermInfo | TermData) {
  return getLocalized(a.label).localeCompare(getLocalized(b.label));
}

declare type TermMap = { [key: string]: Term };

export default class Term extends Asset implements TermData, SupportsSnapshots {
  public label: MultilingualString;
  public altLabels?: PluralMultilingualString;
  public hiddenLabels?: PluralMultilingualString;
  public scopeNote?: MultilingualString;
  public definition?: MultilingualString;
  public exactMatchTerms?: TermInfo[];
  public relatedTerms?: TermInfo[];
  public relatedMatchTerms?: TermInfo[];
  public subTerms?: TermInfo[];
  public parentTerms?: Term[];
  public readonly parent?: string;
  public sources?: string[];
  public plainSubTerms?: string[];
  public readonly vocabulary?: AssetData;
  public readonly definitionSource?: TermOccurrenceData;
  public draft: boolean;

  constructor(termData: TermData, visitedTerms: TermMap = {}) {
    super(termData);
    Object.assign(this, termData);
    this.label = termData.label;
    this.types = Utils.sanitizeArray(termData.types);
    if (this.types.indexOf(VocabularyUtils.TERM) === -1) {
      this.types.push(VocabularyUtils.TERM);
    }
    if (this.parentTerms) {
      this.parentTerms = this.handleParents(this.parentTerms, visitedTerms);
      this.parent = this.resolveParent(this.parentTerms);
    }
    this.sanitizeTermInfoArrays();
    this.syncPlainSubTerms();
    this.draft = termData.draft !== undefined ? termData.draft : true;
  }

  private handleParents(parents: TermData[], visitedTerms: TermMap): Term[] {
    visitedTerms[this.iri] = this;
    const result = Utils.sanitizeArray(parents).map((pt: TermData) =>
      visitedTerms[pt.iri!] ? visitedTerms[pt.iri!] : new Term(pt, visitedTerms)
    );
    result.sort(Utils.labelComparator);
    return result;
  }

  /**
   * jsonld replaces single-element arrays with singular elements, which we don't want here
   * @private
   */
  private sanitizeTermInfoArrays() {
    const toSanitize = [
      "exactMatchTerms",
      "subTerms",
      "relatedTerms",
      "relatedMatchTerms",
    ];
    toSanitize.forEach((n) => {
      if (this[n]) {
        this[n] = Utils.sanitizeArray(this[n]);
      }
    });
  }

  private resolveParent(parents: Term[]) {
    const sameVocabulary = parents.find((t) =>
      _.isEqual(t.vocabulary, this.vocabulary)
    );
    if (sameVocabulary) {
      return sameVocabulary.iri;
    }
    return undefined;
  }

  /**
   * Synchronizes the value of plainSubTerms with subTerms.
   */
  public syncPlainSubTerms() {
    if (this.subTerms) {
      this.plainSubTerms = Utils.sanitizeArray(this.subTerms).map(
        (st) => st.iri
      );
    } else {
      this.plainSubTerms = undefined;
    }
  }

  public toTermData(): TermData {
    const result: any = Object.assign({}, this);
    if (result.parentTerms) {
      result.parentTerms = result.parentTerms.map((pt: Term) => {
        const res = pt.toTermData();
        // No need to track ancestors, they are not updated on the backend anyway
        delete res.parentTerms;
        return res;
      });
    }
    if (result.definitionSource) {
      result.definitionSource.term = { iri: result.iri };
    }
    delete result.subTerms; // Sub-terms are inferred and inconsequential for data upload to server
    delete result.plainSubTerms;
    delete result.parent;
    return result;
  }

  public static toTermInfo(t: Term | TermData): TermInfo {
    return {
      iri: t.iri!,
      label: Object.assign({}, t.label),
      vocabulary: Object.assign({}, t.vocabulary),
      types: [VocabularyUtils.TERM],
    };
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

  getLabel(lang?: string): string {
    return getLocalized(this.label, lang);
  }

  public toJsonLd(): TermData {
    const termData = this.toTermData();
    Object.assign(termData, { "@context": CONTEXT });
    return termData;
  }

  public isSnapshot(): boolean {
    return Term.isSnapshot(this);
  }

  public snapshotOf(): string | undefined {
    return this.unmappedProperties.has(VocabularyUtils.IS_SNAPSHOT_OF_TERM)
      ? this.unmappedProperties.get(VocabularyUtils.IS_SNAPSHOT_OF_TERM)![0]
      : undefined;
  }

  public snapshotCreated(): string | undefined {
    return this.unmappedProperties.has(VocabularyUtils.SNAPSHOT_CREATED)
      ? this.unmappedProperties.get(VocabularyUtils.SNAPSHOT_CREATED)![0]
      : undefined;
  }

  public static isSnapshot(term: Term | TermData | TermInfo) {
    return (
      term.types !== undefined &&
      term.types.indexOf(VocabularyUtils.TERM_SNAPSHOT) !== -1
    );
  }

  /**
   * Removes translation in the specified language from the specified term data.
   *
   * The removal happens in place.
   * @param data Data to remove translation from.
   * @param lang Language to remove
   */
  public static removeTranslation(data: TermData, lang: string) {
    TERM_MULTILINGUAL_ATTRIBUTES.forEach((att) => {
      if (data[att]) {
        delete data[att][lang];
      }
    });
  }

  public static getLanguages(term: Term | TermData): string[] {
    const languages: Set<string> = new Set();
    TERM_MULTILINGUAL_ATTRIBUTES.filter((att) => term[att]).forEach((att) => {
      Utils.sanitizeArray(term[att]).forEach((attValue) =>
        Object.getOwnPropertyNames(attValue).forEach((n) => languages.add(n))
      );
    });
    const langArr = Array.from(languages);
    langArr.sort();
    return langArr;
  }

  public static consolidateRelatedAndRelatedMatch(
    term: Term | TermData
  ): TermInfo[] {
    const result = [...Utils.sanitizeArray(term.relatedTerms)];
    for (let rt of Utils.sanitizeArray(term.relatedMatchTerms)) {
      if (!result.find((e) => e.iri === rt.iri)) {
        result.push(rt);
      }
    }
    result.sort(termComparator);
    return result;
  }

  public static isDraft(term?: TermData | null): boolean {
    return !!term && (term.draft === undefined || term.draft);
  }
}
