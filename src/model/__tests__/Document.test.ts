import Document from "../Document";
import File from "../File";
import Generator from "../../__tests__/environment/Generator";

describe("Document", () => {

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
