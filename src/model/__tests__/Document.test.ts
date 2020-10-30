import Document, {DocumentData} from "../Document";
import File from "../File";
import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../../util/VocabularyUtils";

describe("Document", () => {

    describe("constructor", () => {
        it("initializes all fields", () => {
            const data: DocumentData = {
                iri: Generator.generateUri(),
                label: "Test document",
                vocabulary: {iri: Generator.generateUri()},
                files: [{
                    iri: Generator.generateUri(),
                    label: "Test file",
                    types: [VocabularyUtils.FILE]
                }],
                types: [VocabularyUtils.DOCUMENT]
            };
            data.files[0].owner = data;

            const sut = new Document(data);
            expect(sut.iri).toEqual(data.iri);
            expect(sut.label).toEqual(data.label);
            expect(sut.vocabulary).toBeDefined();
            expect(sut.vocabulary).toEqual(data.vocabulary);
            expect(sut.files.length).toEqual(data.files.length);
        });
    });

    describe("toJsonLd", () => {

        it("breaks circular references by replacing reference to owner with ID-reference in files", () => {
            const sut = new Document({
                iri: Generator.generateUri(),
                label: "Document",
                files: []
            });
            for (let i = 0; i < 5; i++) {
                sut.files.push(new File({
                    iri: Generator.generateUri(),
                    label: "File " + i,
                    owner: sut
                }));
            }

            const result: any = sut.toJsonLd();
            result.files.forEach((f: any) => {
                expect(f.owner).toEqual({iri: sut.iri});
            });
        });
    });
});
