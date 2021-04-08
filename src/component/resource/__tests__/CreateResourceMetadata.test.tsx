import * as React from "react";
import Ajax, { params } from "../../../util/Ajax";
import {
  flushPromises,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Constants from "../../../util/Constants";
import Resource from "../../../model/Resource";
import { CreateResourceMetadata } from "../CreateResourceMetadata";

jest.mock("../../../util/Routing");
jest.mock("../../../util/Ajax", () => {
  const originalModule = jest.requireActual("../../../util/Ajax");
  return {
    ...originalModule,
    default: jest.fn(),
  };
});

describe("CreateResourceMetadata", () => {
  const iri = "http://onto.fel.cvut.cz/ontologies/termit/resource/test";

  let onCreate: (resource: Resource) => Promise<string>;
  let onCancel: () => void;

  beforeEach(() => {
    Ajax.post = jest.fn().mockResolvedValue({ data: iri });
    onCreate = jest.fn().mockResolvedValue(iri);
    onCancel = jest.fn();
  });

  it("enables submit button only when name is not empty", () => {
    const wrapper = mountWithIntl(
      <CreateResourceMetadata
        onCreate={onCreate}
        onCancel={onCancel}
        {...intlFunctions()}
      />
    );
    let submitButton = wrapper.find("button#create-resource-submit").first();
    expect(submitButton.getElement().props.disabled).toBeTruthy();
    const labelInput = wrapper.find('input[name="create-resource-label"]');
    (labelInput.getDOMNode() as HTMLInputElement).value = "Metropolitan Plan";
    labelInput.simulate("change", labelInput);
    submitButton = wrapper.find("button#create-resource-submit");
    expect(submitButton.getElement().props.disabled).toBeFalsy();
  });

  it("calls onCreate on submit click", async () => {
    const wrapper = mountWithIntl(
      <CreateResourceMetadata
        onCreate={onCreate}
        onCancel={onCancel}
        {...intlFunctions()}
      />
    );
    const labelInput = wrapper.find('input[name="create-resource-label"]');
    const label = "Metropolitan Plan";
    (labelInput.getDOMNode() as HTMLInputElement).value = label;
    labelInput.simulate("change", labelInput);
    await flushPromises();
    const submitButton = wrapper.find("button#create-resource-submit");
    submitButton.simulate("click");
    expect(onCreate).toHaveBeenCalled();
    const newResource = (onCreate as jest.Mock).mock.calls[0][0];
    expect(newResource.iri).toEqual(iri);
    expect(newResource.label).toEqual(label);
  });

  describe("IRI generation", () => {
    it("requests IRI generation when name changes", () => {
      const wrapper = mountWithIntl(
        <CreateResourceMetadata
          onCreate={onCreate}
          onCancel={onCancel}
          {...intlFunctions()}
        />
      );
      const labelInput = wrapper.find('input[name="create-resource-label"]');
      const label = "Metropolitan Plan";
      (labelInput.getDOMNode() as HTMLInputElement).value = label;
      labelInput.simulate("change", labelInput);
      return Promise.resolve().then(() => {
        expect(Ajax.post).toHaveBeenCalledWith(
          Constants.API_PREFIX + "/identifiers",
          params({
            name: label,
            assetType: "RESOURCE",
          })
        );
      });
    });

    it("does not request IRI generation when IRI value had been changed manually before", () => {
      const wrapper = mountWithIntl(
        <CreateResourceMetadata
          onCreate={onCreate}
          onCancel={onCancel}
          {...intlFunctions()}
        />
      );
      const iriInput = wrapper.find('input[name="create-resource-iri"]');
      (iriInput.getDOMNode() as HTMLInputElement).value = "http://test";
      iriInput.simulate("change", iriInput);
      const nameInput = wrapper.find('input[name="create-resource-label"]');
      (nameInput.getDOMNode() as HTMLInputElement).value = "Metropolitan Plan";
      nameInput.simulate("change", nameInput);
      expect(Ajax.post).not.toHaveBeenCalled();
    });

    it("displays IRI generated and returned by the server", async () => {
      const wrapper = mountWithIntl(
        <CreateResourceMetadata
          onCreate={onCreate}
          onCancel={onCancel}
          {...intlFunctions()}
        />
      );
      const name = "Metropolitan Plan";
      const labelInput = wrapper.find('input[name="create-resource-label"]');
      (labelInput.getDOMNode() as HTMLInputElement).value = name;
      labelInput.simulate("change", labelInput);
      await flushPromises();
      const iriInput = wrapper.find('input[name="create-resource-iri"]');
      return expect((iriInput.getDOMNode() as HTMLInputElement).value).toEqual(
        iri
      );
    });
  });
});
