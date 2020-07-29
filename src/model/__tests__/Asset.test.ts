import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../../util/VocabularyUtils";
import Resource from "../Resource";
import Asset from "../Asset";

describe("Asset", () => {
    describe("addType", () => {
        it("initializes types with the specified type when they were undefined", () => {
            const asset = new Resource({
                iri: Generator.generateUri(),
                label: "Test"
            });
            asset.types = undefined;
            asset.addType(VocabularyUtils.DOCUMENT);
            expect(asset.types).toBeDefined();
            expect(asset.types).toEqual([VocabularyUtils.DOCUMENT]);
        });

        it("adds specified type to existing asset types", () => {
            const asset = new Resource({
                iri: Generator.generateUri(),
                label: "Test"
            });
            asset.addType(VocabularyUtils.DOCUMENT);
            expect(asset.types).toBeDefined();
            expect(asset.types!.indexOf(VocabularyUtils.DOCUMENT)).not.toEqual(-1);
        });

        it("does not add specified type when it is already present in the types attribute", () => {
            const asset = new Resource({
                iri: Generator.generateUri(),
                label: "Test"
            });
            expect(asset.types!.indexOf(VocabularyUtils.RESOURCE)).not.toEqual(-1);
            const origLength = asset.types!.length;
            asset.addType(VocabularyUtils.RESOURCE);
            expect(asset.types!.length).toEqual(origLength);
        });
    });

    describe("hasType", () => {
        it("checks for specified type presence", () => {
            const asset = Generator.generateTerm();
            expect(asset.hasType(VocabularyUtils.TERM)).toBeTruthy();
            expect(asset.hasType(VocabularyUtils.VOCABULARY)).toBeFalsy();
        });
    });

    describe("equals", () => {

        it("handles null, undefined arguments", () => {
            expect(Asset.equals(undefined, undefined)).toBeTruthy();
            expect(Asset.equals(undefined, null)).toBeTruthy();
            expect(Asset.equals(null, undefined)).toBeTruthy();
            expect(Asset.equals(null, null)).toBeTruthy();
            expect(Asset.equals(Generator.generateTerm(), undefined)).toBeFalsy();
            expect(Asset.equals(Generator.generateTerm(), null)).toBeFalsy();
            expect(Asset.equals(undefined, Generator.generateTerm())).toBeFalsy();
            expect(Asset.equals(null, Generator.generateTerm())).toBeFalsy();
        });

        it("returns true for two assets with the same IRI", () => {
            const a = Generator.generateTerm();
            const b = Generator.generateTerm();
            b.iri = a.iri;
            expect(Asset.equals(a, b)).toBeTruthy();
        });
    });
});
