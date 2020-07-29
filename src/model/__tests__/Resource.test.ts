import Resource, {ResourceData} from "../Resource";
import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../../util/VocabularyUtils";

describe("Resource", () => {
    describe("constructor", () => {
        it("adds Resource type to types when it is not present", () => {
            const data: ResourceData = {
                iri: Generator.generateUri(),
                label: "test"
            };
            const result = new Resource(data);
            expect(result.types).toBeDefined();
            expect(result.types!.indexOf(VocabularyUtils.RESOURCE)).not.toEqual(-1);
        });
    });
});
