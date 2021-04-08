import Generator from "../../__tests__/environment/Generator";
import Comment, { CommentReaction } from "../Comment";

describe("Comment", () => {
    describe("toJsonLd", () => {
        it("breaks circular dependencies between comment and reactions by replacing reaction object with comment iri only", () => {
            const sut = new Comment({
                iri: Generator.generateUri(),
                content: "test  comment",
                author: Generator.generateUser(),
            });
            const reaction: CommentReaction = {
                iri: Generator.generateUri(),
                actor: sut.author!,
                types: ["https://www.w3.org/ns/activitystreams#Like"],
                object: sut,
            };
            sut.reactions = [reaction];

            const result = sut.toJsonLd();
            expect(JSON.stringify(result)).toBeDefined();
            expect(result.reactions![0].object.iri).toEqual(sut.iri);
        });
    });
});
