import VocabularyUtils from "../VocabularyUtils";
import JsonLdUtils from "../JsonLdUtils";
import {CONTEXT as VOCABULARY_CONTEXT} from "../../model/Vocabulary";

describe("JsonLdUtils", () => {

    describe("resolveReferences", () => {
        it("replaces reference node with a known instance in a singular property", () => {
            const data = {
                iri: "http://data",
                author: {
                    iri: "http://user",
                    firstName: "First name",
                    lastName: "lastName",
                    types: [VocabularyUtils.USER]
                },
                created: Date.now() - 10000,
                lastEditor: {
                    iri: "http://user"
                },
                lastModified: Date.now()
            };
            const result:any = JsonLdUtils.resolveReferences(data);
            expect(result.lastEditor).toEqual(data.author);
        });

        it("replaces reference node with a known instance in an array", () => {
            const data = {
                iri: "http://data",
                author: {
                    iri: "http://user",
                    firstName: "First name",
                    lastName: "lastName",
                    types: [VocabularyUtils.USER]
                },
                created: Date.now() - 10000,
                editors: [{
                    iri: "http://user"
                }, {
                    iri: "http://anotherUser",
                    firstName: "Another first name",
                    lastName: "Another last name",
                    types: [VocabularyUtils.USER]
                }],
                lastModified: Date.now()
            };
            const result:any = JsonLdUtils.resolveReferences(data);
            expect(result.editors[0]).toEqual(data.author);
        });
    });

    describe("compactAndResolveReferences", () => {
        it("compacts input JSON-LD using the context and resolves references", () => {
            const input = require("../../rest-mock/vocabulary");
            input[VocabularyUtils.PREFIX + "popisuje-dokument"][VocabularyUtils.PREFIX + "má-dokumentový-slovník"] = {
                "@id": input["@id"]
            };
            return JsonLdUtils.compactAndResolveReferences(input, VOCABULARY_CONTEXT).then((result:any) => {
                expect(result.document.vocabulary).toBeDefined();
                expect(result.document.vocabulary).toEqual(result);
            });
        });
    });

    describe("compactAndResolveReferencesAsArray", () => {
        it("returns array with items compacted from the specified JSON-LD", () => {
            const input = [require("../../rest-mock/vocabulary"), require("../../rest-mock/vocabulary")];
            input[0][VocabularyUtils.PREFIX + "popisuje-dokument"][VocabularyUtils.PREFIX + "má-dokumentový-slovník"] = {
                "@id": input[0]["@id"]
            };
            return JsonLdUtils.compactAndResolveReferencesAsArray(input, VOCABULARY_CONTEXT).then((result:any[]) => {
                expect(Array.isArray(result)).toBeTruthy();
                expect(result[0].document.vocabulary).toBeDefined();
                expect(result[0].document.vocabulary).toEqual(result[0]);
            });
        });

        it("returns array with single item compacted from specified JSON-LD", () => {
            const input = require("../../rest-mock/vocabulary");
            input[VocabularyUtils.PREFIX + "popisuje-dokument"][VocabularyUtils.PREFIX + "má-dokumentový-slovník"] = {
                "@id": input["@id"]
            };
            return JsonLdUtils.compactAndResolveReferencesAsArray(input, VOCABULARY_CONTEXT).then((result:any[]) => {
                expect(Array.isArray(result)).toBeTruthy();
                expect(result.length).toEqual(1);
                expect(result[0].document.vocabulary).toBeDefined();
                expect(result[0].document.vocabulary).toEqual(result[0]);
            });
        });

        it("returns an empty array when input JSON-LD is an empty array", () => {
            const input:object = [];
            return JsonLdUtils.compactAndResolveReferencesAsArray(input, VOCABULARY_CONTEXT).then((result:any[]) => {
                expect(Array.isArray(result)).toBeTruthy();
                expect(result.length).toEqual(0);
            });
        });
    });
});
