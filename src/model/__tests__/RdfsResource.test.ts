import Generator from "../../__tests__/environment/Generator";
import RdfsResource, {CONTEXT, RdfsResourceData} from "../RdfsResource";
import VocabularyUtils from "../../util/VocabularyUtils";

describe("RdfsResource", () => {

    it("constructor is symmetrical to toJsonLd", () => {
        const data: RdfsResourceData = {
            iri: Generator.generateUri(),
            label: "Test",
            comment: "Description",
            types: [VocabularyUtils.RDFS_RESOURCE]
        };
        Object.assign(data, {"@context": CONTEXT});
        const resource = new RdfsResource(data);
        expect(resource.toJsonLd()).toEqual(data);
    });

    it("constructor adds rdfs:Resource to types if it is not present", () => {
        const data: RdfsResourceData = {
            iri: Generator.generateUri(),
            label: "Test",
            comment: "Description"
        };
        Object.assign(data, {"@context": CONTEXT});
        const resource = new RdfsResource(data);
        expect(resource.types.indexOf(VocabularyUtils.RDFS_RESOURCE)).not.toEqual(-1);
    });

    it("constructor does not add rdfs:Resource to types when it is already present", () => {
        const data: RdfsResourceData = {
            iri: Generator.generateUri(),
            label: "Test",
            comment: "Description",
            types: [VocabularyUtils.RDFS_RESOURCE]
        };
        Object.assign(data, {"@context": CONTEXT});
        const resource = new RdfsResource(data);
        expect(resource.types).toEqual(data.types);
    });
});