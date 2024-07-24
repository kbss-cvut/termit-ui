import { Element } from "domhandler";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import {
  annotationIdToTermOccurrenceIri,
  createTermOccurrence,
} from "../AnnotatorUtil";

describe("annotationToTermOccurrenceIri", () => {
  it("extracts term occurrence identifier from annotated file identifier and annotation about value", () => {
    const fileIri = VocabularyUtils.create(Generator.generateUri());
    const localId = Generator.randomInt(100, 10000);

    expect(annotationIdToTermOccurrenceIri("_:" + localId, fileIri)).toEqual(
      `${fileIri.toString()}/occurrences/${localId}`
    );
  });
});

describe("createTermOccurrence", () => {
  it("generates term occurrence with identifier based on file IRI and annotation element about attribute", () => {
    const term = Generator.generateTerm();
    const fileIri = VocabularyUtils.create(Generator.generateUri());
    const localId = Generator.randomInt(100, 10000);
    const annotatedElem = new Element(
      "span",
      { about: `_:${localId}`, id: `id${localId}` },
      []
    );

    const result = createTermOccurrence(term, annotatedElem, fileIri);
    expect(result.iri).toEqual(`${fileIri.toString()}/occurrences/${localId}`);
    expect(result.term).toEqual(term);
    expect(result.target.source).toEqual({ iri: fileIri.toString() });
  });
});
