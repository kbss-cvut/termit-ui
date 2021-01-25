import Utils from "../Utils";
import Term from "../../model/Term";
import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../VocabularyUtils";
import Vocabulary from "../../model/Vocabulary";
import Resource from "../../model/Resource";
import Document from "../../model/Document";
import File from "../../model/File";
import {langString} from "../../model/MultilingualString";

describe("Utils", () => {

    describe("sanitizeArray", () => {
        it("returns array as it is", () => {
            const arr = ["1", "2", "3"];
            expect(Utils.sanitizeArray(arr)).toEqual(arr);
        });

        it("returns single object as a single-element array", () => {
            const elem = 117;
            expect(Utils.sanitizeArray(elem)).toEqual([elem]);
        });

        it("returns empty array for undefined argument", () => {
            expect(Utils.sanitizeArray(undefined)).toEqual([]);
        });

        it("returns empty array for null argument", () => {
            expect(Utils.sanitizeArray(null)).toEqual([]);
        });
    });

    describe("extractQueryParam", () => {
        it("extracts parameter value from query string", () => {
            const value = "http://onto.fel.cvut.cz/ontologies/termit/";
            const queryString = "?namespace=" + value;
            expect(Utils.extractQueryParam(queryString, "namespace")).toEqual(value);
        });

        it("extracts parameter value from query string containing multiple parameters", () => {
            const value = "http://onto.fel.cvut.cz/ontologies/termit/";
            const queryString = "?namespace=" + value + "&searchString=test";
            expect(Utils.extractQueryParam(queryString, "namespace")).toEqual(value);
        });

        it("returns undefined when parameter is not set in query string", () => {
            const queryString = "&searchString=test";
            expect(Utils.extractQueryParam(queryString, "namespace")).not.toBeDefined();
        });
    });

    describe("createPagingParams", () => {
        it("creates empty object for undefined params", () => {
            expect(Utils.createPagingParams()).toEqual({});
        });

        it("creates page object for offset and limit", () => {
            expect(Utils.createPagingParams(0, 100)).toEqual({page: 0, size: 100});
        });

        it("rounds offset up to the closest greater page number", () => {
            expect(Utils.createPagingParams(88, 100)).toEqual({page: 1, size: 100});
            expect(Utils.createPagingParams(173, 100)).toEqual({page: 2, size: 100});
        });

        it("returns empty object when either limit or offset is missing", () => {
            expect(Utils.createPagingParams(117)).toEqual({});
            expect(Utils.createPagingParams(undefined, 100)).toEqual({});
        });
    });

    describe("getAssetTypeLabelId", () => {
        it("returns term type label message id for term", () => {
            const term: Term = new Term({
                iri: Generator.generateUri(),
                label: langString("Test"),
                types: [VocabularyUtils.TERM]
            });
            expect(Utils.getAssetTypeLabelId(term)).toEqual("type.term");
        });

        it("returns vocabulary type label message id for vocabulary", () => {
            const vocabulary: Vocabulary = new Vocabulary({
                iri: Generator.generateUri(),
                label: "Test",
                types: [VocabularyUtils.VOCABULARY]
            });
            expect(Utils.getAssetTypeLabelId(vocabulary)).toEqual("type.vocabulary");
        });

        it("returns resource type label message id for resource", () => {
            const resource: Resource = new Resource({
                iri: Generator.generateUri(),
                label: "Test",
                types: VocabularyUtils.RESOURCE
            });
            expect(Utils.getAssetTypeLabelId(resource)).toEqual("type.resource");
        });

        it("returns document type label message id for document", () => {
            const doc: Document = new Document({
                iri: Generator.generateUri(),
                label: "Test",
                files: [],
                types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE]
            });
            expect(Utils.getAssetTypeLabelId(doc)).toEqual("type.document");
        });

        it("returns file type label message id for file", () => {
            const file: File = new File({
                iri: Generator.generateUri(),
                label: "Test",
                types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE]
            });
            expect(Utils.getAssetTypeLabelId(file)).toEqual("type.file");
        });

        it("returns undefined for asset without type definition", () => {
            const asset: Vocabulary = new Vocabulary({
                iri: Generator.generateUri(),
                label: "Test"
            });
            asset.types = undefined;
            expect(Utils.getAssetTypeLabelId(asset)).not.toBeDefined();
        });

        it("returns undefined for asset with unknown type definition", () => {
            const resource: Resource = new Resource({
                iri: Generator.generateUri(),
                label: "Test"
            });
            resource.types = [VocabularyUtils.RDFS_RESOURCE];
            expect(Utils.getAssetTypeLabelId(resource)).not.toBeDefined();
        });
    });

    describe("labelComparator", () => {
        it("compares specified assets by label", () => {
            const aOne = new Resource({iri: Generator.generateUri(), label: "B"});
            const aTwo = new Resource({iri: Generator.generateUri(), label: "A"});
            expect(Utils.labelComparator(aOne, aTwo)).toEqual(1);
        });
    });

    describe("hashCode", () => {
        it("calculates a hash of the specified string", () => {
            const strOne = "test string one";
            const strTwo = "test string two";
            const resOne = Utils.hashCode(strOne);
            const resTwo = Utils.hashCode(strTwo);
            expect(resOne).not.toEqual(resTwo);
        });

        it("returns 0 for zero-length argument", () => {
            expect(Utils.hashCode("")).toEqual(0);
        });
    });

    describe("withTrailingSlash", () => {
        it("appends trailing slash to specified URL when it does not have it", () => {
            const url = Generator.generateUri();
            expect(url.charAt(url.length - 1)).not.toEqual("/");
            const result = Utils.withTrailingSlash(url);
            expect(result.charAt(result.length - 1)).toEqual("/");
        });

        it("does not append trailing slash when specified URL already contains it", () => {
            const url = Generator.generateUri() + "/";
            expect(Utils.withTrailingSlash(url)).toEqual(url);
        });
    });
});
