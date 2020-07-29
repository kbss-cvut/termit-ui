import Generator from "../../__tests__/environment/Generator";
import Namespaces, {RDFS, SKOS} from "../Namespaces";

describe("Namespaces", () => {

    describe("getPrefixedOrDefault", () => {
        it("returns full IRI if it does not contain any supported namespace", () => {
            const iri = Generator.generateUri();
            expect(Namespaces.getPrefixedOrDefault(iri)).toEqual(iri);
        });

        it("returns local name with prefix when full IRI contains a supported namespace", () => {
            const iri = "http://www.w3.org/2000/01/rdf-schema#label";
            expect(Namespaces.getPrefixedOrDefault(iri)).toEqual(RDFS.prefix + ":label");
        });
    });

    describe("getFullIri", () => {
        it("returns argument if it does not contain any prefix", () => {
            const iri = Generator.generateUri();
            expect(Namespaces.getFullIri(iri)).toEqual(iri);
        });

        it("returns argument if it does not contain any known prefix", () => {
            const prefixed = "jopa:test";
            expect(Namespaces.getFullIri(prefixed)).toEqual(prefixed);
        });

        it("returns full IRI for a prefixed version with a supported prefix", () => {
            const prefixed = SKOS.prefix + ":narrower";
            expect(Namespaces.getFullIri(prefixed)).toEqual("http://www.w3.org/2004/02/skos/core#narrower");
        });
    });
});