import { RdfsResourceData } from "../../../model/RdfsResource";
import CreatePropertyForm from "../CreatePropertyForm";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { mountWithIntl } from "../../../__tests__/environment/Environment";

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
      <CreatePropertyForm onOptionCreate={onCreate} toggleModal={toggleModal} />
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
});
