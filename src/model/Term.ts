import {
  ASSET_CONTEXT,
  AssetData,
  default as Asset,
  Editable,
  HasIdentifier,
} from "./Asset";
import Utils from "../util/Utils";
import WithUnmappedProperties, {
  PropertyValueType,
  stringifyPropertyValue,
} from "./WithUnmappedProperties";
import VocabularyUtils from "../util/VocabularyUtils";
import _ from "lodash";
import {
  BASE_CONTEXT as BASE_OCCURRENCE_CONTEXT,
  TermOccurrenceData,
} from "./TermOccurrence";
import MultilingualString, {
  context,
  getLocalized,
  pluralContext,
  PluralMultilingualString,
} from "./MultilingualString";
import { SupportsSnapshots } from "./Snapshot";
import { getLanguages, removeTranslation } from "../util/IntlUtil";

const ctx = {
  label: context(VocabularyUtils.SKOS_PREF_LABEL),
  altLabels: pluralContext(VocabularyUtils.SKOS_ALT_LABEL),
  hiddenLabels: pluralContext(VocabularyUtils.SKOS_HIDDEN_LABEL),
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
  state: VocabularyUtils.HAS_TERM_STATE,
  glossary: VocabularyUtils.SKOS_IN_SCHEME,
  notations: VocabularyUtils.SKOS_NOTATION,
  examples: pluralContext(VocabularyUtils.SKOS_EXAMPLE),
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
  "state",
  "exactMatchTerms",
  "notations",
  "examples",
];

export const TERM_MULTILINGUAL_ATTRIBUTES = [
  "label",
  "definition",
  "scopeNote",
  "altLabels",
  "hiddenLabels",
  "examples",
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
  vocabulary?: HasIdentifier;
  definitionSource?: TermOccurrenceData;
  state?: HasIdentifier;
  notations?: string[];
  examples?: PluralMultilingualString;
}

export interface TermInfo {
  iri: string;
  label: MultilingualString; // Multilingual string due to the same context item (see ctx above)
  vocabulary: HasIdentifier;
  state?: HasIdentifier;
  types?: string[];
}

/**
 * Creates a localized Term comparator.
 *
 * I.e., the comparator uses term labels in the specified language and compares them based on the specified language/locale.
 * @param lang Language (locale) for comparison, e.g., en, cs
 */
export function createTermComparator(lang?: string) {
  return (a: TermInfo | TermData, b: TermInfo | TermData) => {
    const aLabel = (getLocalized(a.label, lang) || "").toLowerCase();
    const bLabel = (getLocalized(b.label, lang) || "").toLowerCase();
    return aLabel.localeCompare(bLabel, lang);
  };
}

declare type TermMap = { [key: string]: Term };

export default class Term
  extends Asset
  implements TermData, Editable, SupportsSnapshots
{
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
  public readonly vocabulary?: HasIdentifier;
  public readonly definitionSource?: TermOccurrenceData;
  public state?: HasIdentifier;
  public notations?: string[];
  public examples?: PluralMultilingualString;

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
    this.state = termData.state;
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
      ? stringifyPropertyValue(
          this.unmappedProperties.get(VocabularyUtils.IS_SNAPSHOT_OF_TERM)![0]
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

  isEditable(): boolean {
    return !this.isSnapshot();
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
    removeTranslation(TERM_MULTILINGUAL_ATTRIBUTES, data, lang);
  }

  public static getLanguages(term?: Term | TermData | null): string[] {
    return getLanguages(TERM_MULTILINGUAL_ATTRIBUTES, term);
  }

  public static consolidateRelatedAndRelatedMatch(
    term: Term | TermData,
    lang?: string
  ): TermInfo[] {
    const result = [...Utils.sanitizeArray(term.relatedTerms)];
    for (let rt of Utils.sanitizeArray(term.relatedMatchTerms)) {
      if (!result.find((e) => e.iri === rt.iri)) {
        result.push(rt);
      }
    }
    result.sort(createTermComparator(lang));
    return result;
  }
}
