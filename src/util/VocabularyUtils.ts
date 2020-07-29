/**
 * Vocabulary used by the application ontological model.
 */

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
        return other !== undefined && other !== null && this.fragment === other.fragment && this.namespace === other.namespace;
    }

    public static create(iri: IRI): IRIImpl {
        return new IRIImpl(iri.fragment, iri.namespace);
    }

    public static toString(iri: IRI): string {
        return (iri.namespace ? iri.namespace : "") + iri.fragment;
    }
}

const _NS_POPIS_DAT = "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/";
const _NS_TERMIT = "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/";
const _NS_RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const _NS_RDFS = "http://www.w3.org/2000/01/rdf-schema#";
const _NS_SKOS = "http://www.w3.org/2004/02/skos/core#";
const _NS_DC = "http://purl.org/dc/terms/";

export default {
    PREFIX: _NS_POPIS_DAT,
    VOCABULARY: _NS_POPIS_DAT + "slovník",
    DOCUMENT_VOCABULARY: _NS_POPIS_DAT + "dokumentový-slovník",
    TERM: _NS_SKOS + "Concept",
    FILE: _NS_POPIS_DAT + "soubor",
    DOCUMENT: _NS_POPIS_DAT + "dokument",
    DEFINITION: _NS_SKOS + "definition",
    BROADER: _NS_SKOS + "broader",
    NARROWER: _NS_SKOS + "narrower",
    SKOS_PREF_LABEL: _NS_SKOS + "prefLabel",
    SKOS_SCOPE_NOTE: _NS_SKOS + "scopeNote",
    SKOS_IN_SCHEME: _NS_SKOS + "inScheme",
    IS_TERM_FROM_VOCABULARY: _NS_POPIS_DAT + "je-pojmem-ze-slovníku",
    IS_OCCURRENCE_OF_TERM: _NS_TERMIT + "je-výskytem-termu",
    IS_DEFINITION_OF_TERM: _NS_TERMIT + "je-výskytem-definice-termu",
    IS_DRAFT: _NS_TERMIT + "je-draft",
    RESOURCE: _NS_POPIS_DAT + "zdroj",
    TERM_ASSIGNMENT: _NS_TERMIT + "přiřazení-termu",
    TERM_OCCURRENCE: _NS_TERMIT + "výskyt-termu",
    TERM_DEFINITION_SOURCE: _NS_TERMIT + "zdroj-definice-termu",
    SUGGESTED_TERM_OCCURRENCE: _NS_TERMIT + "navržený-výskyt-termu",
    ASSIGNMENT_TARGET: _NS_TERMIT + "c\u00edl",
    FILE_OCCURRENCE_TARGET: _NS_TERMIT + "c\u00edl-souborov\u00e9ho-v\u00fdskytu",
    DEFINITION_OCCURRENCE_TARGET: _NS_TERMIT + "c\u00edl-defini\u010dn\u00edho-v\u00fdskytu",
    TEXT_QUOTE_SELECTOR: _NS_TERMIT + "selektor-text-quote",
    HAS_DEFINITION_SOURCE: _NS_TERMIT + "m\u00e1-zdroj-definice-termu",
    HAS_FILE: _NS_POPIS_DAT + "má-soubor",
    HAS_AUTHOR: _NS_POPIS_DAT + "má-autora",
    CREATED: _NS_POPIS_DAT + "má-datum-a-čas-vytvoření",
    HAS_LAST_EDITOR: _NS_POPIS_DAT + "má-posledního-editora",
    LAST_MODIFIED: _NS_POPIS_DAT + "má-datum-a-čas-poslední-modifikace",
    IMPORTS_VOCABULARY: _NS_POPIS_DAT + "importuje-slovník",
    NS_TERMIT: _NS_TERMIT,
    USER: _NS_TERMIT + "uživatel-termitu",
    USER_ADMIN: _NS_TERMIT + "administrátor-termitu",
    USER_LOCKED: _NS_TERMIT + "uzam\u010den\u00fd-u\u017eivatel-termitu",
    USER_DISABLED: _NS_TERMIT + "zablokovan\u00fd-u\u017eivatel-termitu",
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

    PERSIST_EVENT: `${_NS_POPIS_DAT}vytvo\u0159en\u00ed-entity`,
    UPDATE_EVENT: `${_NS_POPIS_DAT}\u00faprava-entity`,

    getFragment(iri: string): string {
        return this.create(iri).fragment;
    },

    create(iri: string): IRIImpl {
        const hashFragment = iri.indexOf("#");
        const slashFragment = iri.lastIndexOf("/");
        const fragment = hashFragment < 0 ? slashFragment : hashFragment;
        return new IRIImpl(iri.substr(fragment + 1), iri.substr(0, fragment + 1));
    }
}
