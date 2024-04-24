import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import { annotationIdToTermOccurrenceIri } from "../AnnotatorUtil";

describe("annotationToTermOccurrenceIri", () => {
  it("extracts term occurrence identifier from annotated file identifier and annotation about value", () => {
    const fileIri = VocabularyUtils.create(Generator.generateUri());
    const localId = Generator.randomInt(100, 10000);

    expect(annotationIdToTermOccurrenceIri("_:" + localId, fileIri)).toEqual(
      `${fileIri.toString()}/occurrences/${localId}`
    );
  });
});
