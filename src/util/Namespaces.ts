interface Namespace {
    prefix: string;
    namespace: string;
}

export const OWL: Namespace = {
    prefix: "owl",
    namespace: "http://www.w3.org/2002/07/owl#",
};

export const RDFS: Namespace = {
    prefix: "rdfs",
    namespace: "http://www.w3.org/2000/01/rdf-schema#",
};

export const RDF: Namespace = {
    prefix: "rdf",
    namespace: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
};

export const SKOS: Namespace = {
    prefix: "skos",
    namespace: "http://www.w3.org/2004/02/skos/core#",
};

export const DC_TERMS: Namespace = {
    prefix: "dcterms",
    namespace: "http://purl.org/dc/terms/",
};

export default class Namespaces {
    private static SUPPORTED = [RDF, RDFS, SKOS, DC_TERMS];

    /**
     * Resolves a prefix-based IRI from the specified full IRI.
     *
     * If the IRI does not contain any supported namespace, it is returned in its full form.
     * @param iri IRI to resolve
     */
    public static getPrefixedOrDefault(iri: string): string {
        const ns = Namespaces.SUPPORTED.find(
            (n) => iri.indexOf(n.namespace) !== -1
        );
        if (ns) {
            return ns.prefix + ":" + iri.substring(ns.namespace.length);
        }
        return iri;
    }

    /**
     * Resolves full IRI from the specified prefixed version.
     *
     * If the argument does not contain any known prefix, it is returned as is.
     * @param prefixed Prefixed IRI to expand
     */
    public static getFullIri(prefixed: string): string {
        const split = prefixed.split(":");
        if (split.length !== 2) {
            return prefixed;
        }
        const prefix = split[0];
        const ns = Namespaces.SUPPORTED.find((n) => n.prefix === prefix);
        return ns ? ns.namespace + split[1] : prefixed;
    }
}
