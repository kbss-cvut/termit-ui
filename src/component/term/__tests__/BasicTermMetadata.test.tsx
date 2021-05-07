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
import {mountWithIntl} from "../../../__tests__/environment/Environment";

jest.mock("../TermLink", () => () => <span>Term link</span>);
jest.mock("../../misc/OutgoingLink", () => () => <span>Outgoing link</span>);

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
      scopeNote: langString("test"),
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

  it("renders parent term link when parent term exists", () => {
    term.parentTerms = [
      new Term({
        iri: Generator.generateUri(),
        label: langString("Parent"),
        vocabulary: { iri: Generator.generateUri() },
      }),
    ];
    const wrapper = shallow(
      <BasicTermMetadata
        term={term}
        language={Constants.DEFAULT_LANGUAGE}
        {...intlFunctions()}
      />
    );
    const parentLinks = wrapper.find(TermLink);
    expect(parentLinks.length).toEqual(term.parentTerms.length);
  });

  it("consolidates related and relatedMatch terms and renders them in one list",() => {
    term.relatedTerms = [{
      iri: Generator.generateUri(),
      label: langString("related one"),
      vocabulary: {iri: term.vocabulary!.iri}
    }];
    term.relatedMatchTerms = [{
      iri: Generator.generateUri(),
      label: langString("related one"),
      vocabulary: {iri: Generator.generateUri()}
    }];

    const wrapper = mountWithIntl(
        <BasicTermMetadata
            term={term}
            language={Constants.DEFAULT_LANGUAGE}
            {...intlFunctions()}
        />
    );
    const relatedList = wrapper.find("#term-metadata-related");
    expect(relatedList.find(TermLink).length).toEqual(term.relatedTerms.length + term.relatedMatchTerms.length);
  });
});
