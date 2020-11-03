import * as React from "react";
import Ajax from "../../../util/Ajax";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import Resource from "../../../model/Resource";
import {CreateResource} from "../CreateResource";
import {CreateFileMetadata} from "../file/CreateFileMetadata";
import {CreateResourceMetadata} from "../CreateResourceMetadata";
import {shallow} from "enzyme";

jest.mock("../../../util/Routing");
jest.mock("../../../util/Ajax", () => {
    const originalModule = jest.requireActual("../../../util/Ajax");
    return {
        ...originalModule,
        default: jest.fn()
    };
});

describe("CreateResource", () => {
    const iri = "http://onto.fel.cvut.cz/ontologies/termit/resource/test";

    let onCreate: (resource: Resource) => Promise<string>;

    beforeEach(() => {
        Ajax.post = jest.fn().mockImplementation(() => Promise.resolve( { data: iri } ));
        onCreate = jest.fn().mockImplementation(() => Promise.resolve(iri));
    });

    it("returns to Resource Management on cancel", () => {
        shallow<CreateResource>(<CreateResource onCreate={onCreate} {...intlFunctions()}/>);
        CreateResource.onCancel();
        expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.resources);
    });

    it("onCreate is passed data with selected resource type", () => {
        const wrapper = mountWithIntl(<CreateResource onCreate={onCreate}  {...intlFunctions()}/>);
        const typeSelectButtons = wrapper.find("button.create-resource-type-select");
        expect(typeSelectButtons.length).toEqual(3);
        typeSelectButtons.at(1).simulate("click");
        const labelInput = wrapper.find("input[name=\"create-resource-label\"]");
        (labelInput.getDOMNode() as HTMLInputElement).value = "Metropolitan Plan";
        labelInput.simulate("change", labelInput);
        const iriInput = wrapper.find("input[name=\"create-resource-iri\"]");
        (iriInput.getDOMNode() as HTMLInputElement).value = iri;
        iriInput.simulate("change", iriInput);
        wrapper.find("button#create-resource-submit").simulate("click");
        expect(onCreate).toHaveBeenCalled();
        const resource = (onCreate as jest.Mock).mock.calls[0][0];
        expect(resource.types).toBeDefined();
    });

    it("renders CreateFileMetadata component when File type is selected", () => {
        const wrapper = mountWithIntl(<CreateResource onCreate={onCreate}  {...intlFunctions()}/>);
        wrapper.find("button#create-resource-type-file").simulate("click");
        expect(wrapper.find(CreateFileMetadata).exists()).toBeTruthy();
    });

    it("renders CreateResourceMetadata component for all resource types except File", () => {
        const wrapper = mountWithIntl(<CreateResource onCreate={onCreate}  {...intlFunctions()}/>);
        expect(wrapper.find(CreateResourceMetadata).exists()).toBeTruthy();
        wrapper.find("button#create-resource-type-document").simulate("click");
        expect(wrapper.find(CreateResourceMetadata).exists()).toBeTruthy();
    });

    it("transitions to Resource detail on successful creation", () => {
        const wrapper = shallow<CreateResource>(<CreateResource
            onCreate={onCreate} {...intlFunctions()}/>);
        wrapper.instance().onCreate(new Resource({iri, label: "Test"}));
        return Promise.resolve().then(() => {
            expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.resourceSummary, {
                params: new Map([["name", "test"]]),
                query: new Map()
            });
        })
    });

    it("returns resolved identifier on successful creation", () => {
        const wrapper = shallow<CreateResource>(<CreateResource
            onCreate={onCreate} {...intlFunctions()}/>);
        return wrapper.instance().onCreate(new Resource({iri, label: "Test"})).then(result => {
            expect(result).toBeDefined();
            expect(result).toEqual(iri);
        })
    });
});
