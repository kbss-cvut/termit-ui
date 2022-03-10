import Resource from "../../../model/Resource";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import { ResourceEdit } from "../ResourceEdit";
import { shallow } from "enzyme";
import File from "../../../model/File";
import VocabularyUtils from "../../../util/VocabularyUtils";

describe("ResourceEdit", () => {
  let resource: Resource;
  let cancel: () => Promise<any>;
  let save: () => Promise<any>;

  beforeEach(() => {
    resource = new Resource({
      iri: Generator.generateUri(),
      label: "test term",
      terms: [],
    });
    cancel = jest.fn();
    save = jest.fn();
  });

  it("calls onSave on Save button click", () => {
    const component = mountWithIntl(
      <ResourceEdit
        {...intlFunctions()}
        cancel={cancel}
        resource={resource}
        save={save}
      />
    );
    const saveButton = component.find("button#edit-resource-submit");
    saveButton.simulate("click", saveButton);
    expect(save).toHaveBeenCalled();
  });

  it("calls onCancel on Cancel button click", () => {
    const component = mountWithIntl(
      <ResourceEdit
        {...intlFunctions()}
        cancel={cancel}
        resource={resource}
        save={save}
      />
    );
    component.find("button#edit-resource-cancel").simulate("click");
    expect(cancel).toHaveBeenCalled();
  });

  it("passes updated values on save", () => {
    const component = mountWithIntl(
      <ResourceEdit
        {...intlFunctions()}
        save={save}
        cancel={cancel}
        resource={resource}
      />
    );
    const labelInput = component.find("input[name='edit-resource-label']");
    const newLabel = "New label";
    (labelInput.getDOMNode() as HTMLInputElement).value = newLabel;
    labelInput.simulate("change", labelInput);
    const descriptionInput = component.find(
      "textarea[name='edit-resource-description']"
    );
    const newDescription = "New description";
    (descriptionInput.getDOMNode() as HTMLInputElement).value = newDescription;
    descriptionInput.simulate("change", descriptionInput);
    component.find("button#edit-resource-submit").simulate("click");
    expect(save).toHaveBeenCalled();
    const update = (save as jest.Mock).mock.calls[0][0];
    expect(update).not.toEqual(resource);
    expect(update.label).toEqual(newLabel);
    expect(update.description).toEqual(newDescription);
    expect(update.terms).toEqual(resource.terms);
  });

  describe("onSave", () => {
    it("invokes save handler with updated instance of the correct type", () => {
      const file = new File(
        Object.assign(Generator.generateAssetData(), {
          types: [VocabularyUtils.RESOURCE, VocabularyUtils.FILE],
        })
      );
      const wrapper = shallow<ResourceEdit>(
        <ResourceEdit
          resource={file}
          save={save}
          cancel={cancel}
          {...intlFunctions()}
        />
      );
      wrapper.instance().onSave();
      const update = (save as jest.Mock).mock.calls[0][0];
      expect(update instanceof File);
    });
  });
});
