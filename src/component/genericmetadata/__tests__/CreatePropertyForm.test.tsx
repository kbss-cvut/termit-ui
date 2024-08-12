import { RdfsResourceData } from "../../../model/RdfsResource";
import CreatePropertyForm from "../CreatePropertyForm";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { changeInputValue } from "../../../__tests__/environment/TestUtil";

describe("CreatePropertyForm", () => {
  let onCreate: (data: RdfsResourceData) => void;
  let toggleModal: () => void;

  beforeEach(() => {
    onCreate = jest.fn();
    toggleModal = jest.fn();
  });

  it("adds rdf:Property to types on create", () => {
    mockUseI18n();
    const wrapper = mountWithIntl(
      <CreatePropertyForm
        onOptionCreate={onCreate}
        toggleModal={toggleModal}
        languages={["en"]}
        language={"en"}
      />
    );
    const iriInput = wrapper.find("input[name='iri']");
    (iriInput.getDOMNode() as HTMLInputElement).value = Generator.generateUri();
    iriInput.simulate("change", iriInput);
    const labelInput = wrapper.find("input[name='label']");
    (labelInput.getDOMNode() as HTMLInputElement).value = "Test";
    labelInput.simulate("change", labelInput);
    wrapper.find("button#create-property-submit").simulate("click");
    expect(onCreate).toHaveBeenCalled();
    const data: RdfsResourceData = (onCreate as jest.Mock).mock.calls[0][0];
    expect(data.types).toBeDefined();
    expect(data.types!.indexOf(VocabularyUtils.RDF_PROPERTY)).not.toEqual(-1);
  });

  it("wont send label and comment as empty strings when they are blank", () => {
    const languages = ["en", "cs"];
    const language = "en";
    const wrapper = mountWithIntl(
      <CreatePropertyForm
        onOptionCreate={onCreate}
        toggleModal={toggleModal}
        languages={languages}
        language={language}
      />
    );
    const SPACE_CHARACTER = " ";
    const iriInput = wrapper.find("input[name='iri']");
    const labelInput = wrapper.find("input[name='label']");
    const commentInput = wrapper.find("textarea[name='comment']");
    const submitButton = wrapper.find("button#create-property-submit");
    const iri = Generator.generateUri();

    changeInputValue(iriInput, iri);
    changeInputValue(labelInput, SPACE_CHARACTER);
    changeInputValue(commentInput, SPACE_CHARACTER);

    submitButton.simulate("click");
    expect(onCreate).toHaveBeenCalledWith({
      iri,
      label: undefined,
      comment: undefined,
      types: [VocabularyUtils.RDF_PROPERTY],
    });
  });
});
