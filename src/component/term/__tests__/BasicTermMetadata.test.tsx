import * as React from "react";
import Vocabulary from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import Term, { TermInfo } from "../../../model/Term";
import { shallow } from "enzyme";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import TermLink from "../TermLink";
import VocabularyUtils from "../../../util/VocabularyUtils";
import OutgoingLink from "../../misc/OutgoingLink";
import { BasicTermMetadata } from "../BasicTermMetadata";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";

describe("BasicTermMetadata", () => {
  const vocabulary: Vocabulary = new Vocabulary({
    iri: Generator.generateUri(),
    label: "Test vocabulary",
  });
  let term: Term;

  beforeEach(() => {
    term = new Term({
      iri: Generator.generateUri(),
      label: langString("Test"),
      definition: langString("test"),
      vocabulary: { iri: vocabulary.iri },
    });
  });

  it("renders sub terms as term links", () => {
    const subTerms: TermInfo[] = [
      {
        iri: Generator.generateUri(),
        label: langString("SubTerm"),
        vocabulary: { iri: vocabulary.iri },
      },
    ];
    term.subTerms = subTerms;
    const wrapper = shallow(
      <BasicTermMetadata
        term={term}
        language={Constants.DEFAULT_LANGUAGE}
        {...intlFunctions()}
      />
    );
    const subTermLinks = wrapper.find(TermLink);
    expect(subTermLinks.length).toEqual(subTerms.length);
  });

  it("skips implicit term type when rendering types", () => {
    term.types = [VocabularyUtils.TERM, Generator.generateUri()];
    const wrapper = shallow(
      <BasicTermMetadata
        term={term}
        language={Constants.DEFAULT_LANGUAGE}
        {...intlFunctions()}
      />
    );
    const renderedTypes = wrapper.find(OutgoingLink);
    expect(renderedTypes.length).toEqual(1);
    expect(renderedTypes.get(0).props.iri).toEqual(term.types[1]);
  });
});
