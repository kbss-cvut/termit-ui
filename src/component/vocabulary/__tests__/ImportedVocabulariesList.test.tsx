import { shallow } from "enzyme";
import { ImportedVocabulariesList } from "../ImportedVocabulariesList";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyIriLink from "../VocabularyIriLink";

describe("ImportedVocabulariesList", () => {
  it("renders links to provided vocabularies", () => {
    mockUseI18n();
    const vocabularies = [
      {
        iri: Generator.generateUri(),
      },
      {
        iri: Generator.generateUri(),
      },
    ];
    const wrapper = shallow(
      <ImportedVocabulariesList vocabularies={vocabularies} />
    );
    expect(wrapper.find(VocabularyIriLink).length).toEqual(2);
  });
});
