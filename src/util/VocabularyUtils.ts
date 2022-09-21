/**
 * Vocabulary used by the application ontological model.
 */
import { getVocabularyShortLabel } from "@opendata-mvcr/assembly-line-shared";
import en from "../i18n/en";
import cs from "../i18n/cs";

export interface IRI {
  namespace?: string;
  fragment: string;
}

export class IRIImpl implements IRI {
  public readonly fragment: string;
  public readonly namespace?: string;

  constructor(fragment: string, namespace?: string) {
    this.fragment = fragment;
    this.namespace = namespace;
  }

  public toString(): string {
    return IRIImpl.toString(this);
  }

  public equals(other?: IRI | null): boolean {
    return (
      other !== undefined &&
      other !== null &&
      this.fragment === other.fragment &&
      this.namespace === other.namespace
    );
  }

  public static create(iri: IRI): IRIImpl {
    return new IRIImpl(iri.fragment, iri.namespace);
  }

  public static toString(iri: IRI): string {
    return (iri.namespace ? iri.namespace : "") + iri.fragment;
  }
}

const _NS_POPIS_DAT =
  "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/";
const _NS_TERMIT =
  "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/";
const _NS_RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const _NS_RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const _NS_SKOS = "http://www.w3.org/2004/02/skos/core#";
const _NS_DC = "http://purl.org/dc/terms/";
const _NS_SH = "http://www.w3.org/ns/shacl#";
const _NS_SIOC = "http://rdfs.org/sioc/";
const _NS_ACTIVITY_STREAMS = "http://www.w3.org/ns/activitystreams#";

const VocabularyUtils = {
  PREFIX: _NS_POPIS_DAT,
  VOCABULARY: _NS_POPIS_DAT + "slovník",
  DOCUMENT_VOCABULARY: _NS_POPIS_DAT + "dokumentový-slovník",
  HAS_DOCUMENT_VOCABULARY: _NS_POPIS_DAT + "má-dokumentový-slovník",
  DESCRIBES_DOCUMENT: _NS_POPIS_DAT + "popisuje-dokument",
  HAS_GLOSSARY: _NS_POPIS_DAT + "má-glosář",
  HAS_MODEL: _NS_POPIS_DAT + "má-model",
  TERM: _NS_SKOS + "Concept",
  FILE: _NS_POPIS_DAT + "soubor",
  CONTENT: _NS_POPIS_DAT + "soubor/content",
  IS_PART_OF_DOCUMENT: _NS_POPIS_DAT + "je-částí-dokumentu",
  DOCUMENT: _NS_POPIS_DAT + "dokument",
  DEFINITION: _NS_SKOS + "definition",
  BROADER: _NS_SKOS + "broader",
  NARROWER: _NS_SKOS + "narrower",
  SKOS_PREF_LABEL: _NS_SKOS + "prefLabel",
  SKOS_ALT_LABEL: _NS_SKOS + "altLabel",
  SKOS_HIDDEN_LABEL: _NS_SKOS + "hiddenLabel",
  SKOS_SCOPE_NOTE: _NS_SKOS + "scopeNote",
  SKOS_IN_SCHEME: _NS_SKOS + "inScheme",
  SKOS_EXACT_MATCH: _NS_SKOS + "exactMatch",
  SKOS_RELATED: _NS_SKOS + "related",
  SKOS_RELATED_MATCH: _NS_SKOS + "relatedMatch",
  IS_TERM_FROM_VOCABULARY: _NS_POPIS_DAT + "je-pojmem-ze-slovníku",
  IS_OCCURRENCE_OF_TERM: _NS_TERMIT + "je-výskytem-termu",
  IS_DEFINITION_OF_TERM: _NS_TERMIT + "je-výskytem-definice-termu",
  IS_DRAFT: _NS_TERMIT + "je-draft",
  RESOURCE: _NS_POPIS_DAT + "zdroj",
  TERM_ASSIGNMENT: _NS_TERMIT + "přiřazení-termu",
  TERM_OCCURRENCE: _NS_TERMIT + "výskyt-termu",
  TERM_DEFINITION_SOURCE: _NS_TERMIT + "zdroj-definice-termu",
  JE_TEMATEM: _NS_TERMIT + "je-tématem",
  MA_MUJ_POSLEDNI_KOMENTAR: _NS_TERMIT + "má-můj-poslední-komentář",
  SUGGESTED_TERM_OCCURRENCE: _NS_TERMIT + "navržený-výskyt-termu",
  ASSIGNMENT_TARGET: _NS_TERMIT + "c\u00edl",
  FILE_OCCURRENCE_TARGET: _NS_TERMIT + "c\u00edl-souborov\u00e9ho-v\u00fdskytu",
  DEFINITION_OCCURRENCE_TARGET:
    _NS_TERMIT + "c\u00edl-defini\u010dn\u00edho-v\u00fdskytu",
  TEXT_QUOTE_SELECTOR: _NS_TERMIT + "selektor-text-quote",
  HAS_DEFINITION_SOURCE: _NS_TERMIT + "m\u00e1-zdroj-definice-termu",
  HAS_FILE: _NS_POPIS_DAT + "má-soubor",
  HAS_AUTHOR: _NS_POPIS_DAT + "má-autora",
  CREATED: _NS_POPIS_DAT + "má-datum-a-čas-vytvoření",
  SNAPSHOT_CREATED: _NS_POPIS_DAT + "má-datum-a-čas-vytvoření-verze",
  HAS_LAST_EDITOR: _NS_POPIS_DAT + "má-posledního-editora",
  LAST_MODIFIED: _NS_POPIS_DAT + "má-datum-a-čas-poslední-modifikace",
  IMPORTS_VOCABULARY: _NS_POPIS_DAT + "importuje-slovník",
  NS_TERMIT: _NS_TERMIT,
  USER: _NS_TERMIT + "uživatel-termitu",
  USER_ADMIN: _NS_TERMIT + "administrátor-termitu",
  USER_LOCKED: _NS_TERMIT + "uzam\u010den\u00fd-u\u017eivatel-termitu",
  USER_DISABLED: _NS_TERMIT + "zablokovan\u00fd-u\u017eivatel-termitu",
  USER_RESTRICTED: _NS_TERMIT + "omezen\u00fd-u\u017eivatel-termitu",
  USER_EDITOR: _NS_TERMIT + "pln\u00fd-u\u017eivatel-termitu",
  HAS_COUNT: _NS_TERMIT + "has-count",
  PREFIX_RDFS: _NS_RDFS,
  RDF_TYPE: _NS_RDF + "type",
  RDFS_LABEL: _NS_RDFS + "label",
  RDFS_COMMENT: _NS_RDFS + "comment",
  RDFS_RESOURCE: _NS_RDFS + "Resource",
  RDFS_SUB_CLASS_OF: _NS_RDFS + "subClassOf",
  RDFS_SUB_PROPERTY_OF: _NS_RDFS + "subPropertyOf",
  RDF_PROPERTY: _NS_RDF + "Property",
  PREFIX_DC: _NS_DC,
  DC_TITLE: _NS_DC + "title",
  DC_DESCRIPTION: _NS_DC + "description",
  DC_SOURCE: _NS_DC + "source",
  DC_FORMAT: _NS_DC + "format",
  DC_LICENSE: _NS_DC + "license",
  DC_MODIFIED: _NS_DC + "modified",
  DC_LANGUAGE: _NS_DC + "language",

  SH_RESULT_SEVERITY: _NS_SH + "resultSeverity",
  SH_SOURCE_SHAPE: _NS_SH + "sourceShape",
  SH_RESULT_MESSAGE: _NS_SH + "resultMessage",
  SH_RESULT_PATH: _NS_SH + "resultPath",
  SH_FOCUS_NODE: _NS_SH + "focusNode",
  SH_VIOLATION: _NS_SH + "Violation",
  SH_WARNING: _NS_SH + "Warning",

  NS_SIOC: _NS_SIOC,
  COMMENT: _NS_SIOC + "types#Comment",

  NS_ACTIVITY_STREAMS: _NS_ACTIVITY_STREAMS,

  PERSIST_EVENT: `${_NS_POPIS_DAT}vytvo\u0159en\u00ed-entity`,
  UPDATE_EVENT: `${_NS_POPIS_DAT}\u00faprava-entity`,

  TERM_SNAPSHOT: _NS_POPIS_DAT + "verze-pojmu",
  VOCABULARY_SNAPSHOT: _NS_POPIS_DAT + "verze-slovníku",
  IS_SNAPSHOT_OF_TERM: _NS_POPIS_DAT + "je-verz\u00ed-pojmu",
  IS_SNAPSHOT_OF_VOCABULARY: _NS_POPIS_DAT + "je-verz\u00ed-slovn\u00edku",

  IS_READ_ONLY: `${_NS_TERMIT}pouze-pro-\u010dten\u00ed`,

  getFragment(iri: string): string {
    return this.create(iri).fragment;
  },

  create(iri: string): IRIImpl {
    const hashFragment = iri.indexOf("#");
    const slashFragment = iri.lastIndexOf("/");
    const fragment = hashFragment < 0 ? slashFragment : hashFragment;
    return new IRIImpl(
      iri.substring(fragment + 1),
      iri.substring(0, fragment + 1)
    );
  },
};

/**
 * Resolves a shortened version of the specified vocabulary IRI useful for display as vocabulary badge.
 * @param iri Vocabulary IRI
 */
export function getShortVocabularyLabel(iri: string): string {
  // Try matching pattern for SGoV-based vocabularies
  let result = getVocabularyShortLabel(iri);
  if (result) {
    return result;
  }
  // Just the part after the last /
  const lastIriPart = iri.substring(iri.lastIndexOf("/") + 1);
  // Trim duplicate non-alphanumeric characters
  const removedDuplicates = lastIriPart.replace(/([^a-zA-Z0-9])\1{2,}/g, "$1");
  // Remove slovnik/vocabulary and everything before it (typically test-vocabulary-...)
  const vocTypeEn = en.messages["type.vocabulary"].toLowerCase();
  const vocTypeCs = cs.messages["type.vocabulary"].toLowerCase();
  let removedTypeLabel = "";
  if (removedDuplicates.indexOf(vocTypeEn) !== -1) {
    removedTypeLabel = removedDuplicates.substring(
      removedDuplicates.indexOf(vocTypeEn) + vocTypeEn.length + 1
    );
  } else if (removedDuplicates.indexOf(vocTypeCs) !== -1) {
    removedTypeLabel = removedDuplicates.substring(
      removedDuplicates.indexOf(vocTypeCs) + vocTypeCs.length + 1
    );
  }
  if (removedTypeLabel.length === 0) {
    return removedDuplicates;
  }
  if (removedTypeLabel.length <= VOCABULARY_SHORT_LABEL_MAX_LENGTH) {
    return removedTypeLabel;
  }
  let split: string[] = removedTypeLabel.split(
    VOCABULARY_SHORT_LABEL_SEPARATOR
  );
  split = split.map((s: string) => (s.length > 2 ? s.substring(0, 2) : s));
  result = split.join(VOCABULARY_SHORT_LABEL_SEPARATOR);
  return result;
}

const VOCABULARY_SHORT_LABEL_MAX_LENGTH = 15;
const VOCABULARY_SHORT_LABEL_SEPARATOR = "-";

export default VocabularyUtils;
