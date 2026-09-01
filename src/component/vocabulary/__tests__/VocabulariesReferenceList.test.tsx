import { shallow } from "enzyme";
import VocabulariesReferenceList from "../VocabulariesReferenceList";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyIriLink from "../VocabularyIriLink";

describe("VocabulariesReferenceList", () => {
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
      <VocabulariesReferenceList
        vocabularies={vocabularies}
        labelKey="vocabulary.importedVocabularies"
        htmlId="imported-vocabularies-list"
      />
    );
    expect(wrapper.find(VocabularyIriLink).length).toEqual(2);
  });
});
