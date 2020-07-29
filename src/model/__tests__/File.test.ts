import File from "../File";
import {DocumentData} from "../Document";
import Generator from "../../__tests__/environment/Generator";

describe("File", () => {

    describe("toJsonLd", () => {

        function generateDocumentData(): DocumentData {
            return {
                iri: Generator.generateUri(),
                label: "Document",
                files: []
            };
        }

        function generateFile(owner: DocumentData) {
            return new File({
                iri: Generator.generateUri(),
                label: "Test file " + Generator.randomInt(0, 10),
                owner
            });
        }

        it("replaces circular reference from owner with ID-based reference", () => {
            const document = generateDocumentData();
            const sut = generateFile(document);
            document.files.push(sut);

            const result: any = sut.toJsonLd();
            expect(result.owner.files).not.toContain(sut);
            expect(result.owner.files).toEqual([{iri: sut.iri}]);
        });

        it("returns object which can be serialized to JSON", () => {
            const document: DocumentData = {
                iri: Generator.generateUri(),
                label: "Document",
                files: []
            };
            const fOne = new File({
                iri: Generator.generateUri(),
                label: "File one",
                owner: document
            });
            const sut = new File({
                iri: Generator.generateUri(),
                label: "Test file",
                owner: document
            });
            document.files = [fOne, sut];
            const result: any = sut.toJsonLd();
            const json = JSON.stringify(result);
            JSON.parse(json);
        });
    });
});
