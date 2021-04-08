import * as React from "react";
import Ajax from "../../../util/Ajax";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Resource from "../../../model/Resource";
import {CreateResourceForm} from "../CreateResourceForm";
import {CreateResourceMetadata} from "../CreateResourceMetadata";
import {shallow} from "enzyme";
import TermItFile from "../../../model/File";
import AppNotification from "../../../model/AppNotification";
import {Files} from "../document/Files";

jest.mock("../../../util/Routing");
jest.mock("../../../util/Ajax", () => {
    const originalModule = jest.requireActual("../../../util/Ajax");
    return {
        ...originalModule,
        default: jest.fn()
    };
});

describe("CreateResourceForm", () => {
    const iri = "http://onto.fel.cvut.cz/ontologies/termit/resource/test";

    let createResource: (resource: Resource) => Promise<string>;
    let createFile: (file: TermItFile, documentIri: string) => Promise<any>;
    let uploadFileContent: (fileIri: string, file: File) => Promise<any>;
    let publishNotification: (notification: AppNotification) => void;
    let onCancel: () => void;
    let onSuccess: (iri: string) => void;

    beforeEach(() => {
        Ajax.post = jest.fn().mockImplementation(() => Promise.resolve({data: iri}));
        createResource = jest.fn().mockImplementation(() => Promise.resolve(iri));
        createFile = jest.fn();
        uploadFileContent = jest.fn();
        publishNotification = jest.fn().mockImplementation(() => Promise.resolve());
        onCancel = jest.fn();
        onSuccess = jest.fn();
    });

    it("onCreate is passed data with selected resource type", () => {
        const wrapper = mountWithIntl(
            <CreateResourceForm
                createResource={createResource}
                createFile={createFile}
                uploadFileContent={uploadFileContent}
                publishNotification={publishNotification}
                onCancel={onCancel}
                onSuccess={onSuccess}
                justDocument={false}
                {...intlFunctions()}
            />
        );
        const typeSelectButtons = wrapper.find("button.create-resource-type-select");
        expect(typeSelectButtons.length).toEqual(2);
        typeSelectButtons.at(1).simulate("click");
        const labelInput = wrapper.find('input[name="create-resource-label"]');
        (labelInput.getDOMNode() as HTMLInputElement).value = "Metropolitan Plan";
        labelInput.simulate("change", labelInput);
        const iriInput = wrapper.find('input[name="create-resource-iri"]');
        (iriInput.getDOMNode() as HTMLInputElement).value = iri;
        iriInput.simulate("change", iriInput);
        wrapper.find("button#create-resource-submit").simulate("click");
        expect(createResource).toHaveBeenCalled();
        const resource = (createResource as jest.Mock).mock.calls[0][0];
        expect(resource.types).toBeDefined();
    });

    it("renders Files component when Document type is selected", () => {
        const wrapper = mountWithIntl(
            <CreateResourceForm
                createResource={createResource}
                createFile={createFile}
                uploadFileContent={uploadFileContent}
                publishNotification={publishNotification}
                onCancel={onCancel}
                onSuccess={onSuccess}
                justDocument={false}
                {...intlFunctions()}
            />
        );
        wrapper.find("button#create-resource-type-document").simulate("click");
        expect(wrapper.find(Files).exists()).toBeTruthy();
    });

    it("renders CreateResourceMetadata component for all resource types except File", () => {
        const wrapper = mountWithIntl(
            <CreateResourceForm
                createResource={createResource}
                createFile={createFile}
                uploadFileContent={uploadFileContent}
                publishNotification={publishNotification}
                onCancel={onCancel}
                onSuccess={onSuccess}
                justDocument={false}
                {...intlFunctions()}
            />
        );
        expect(wrapper.find(CreateResourceMetadata).exists()).toBeTruthy();
        wrapper.find("button#create-resource-type-document").simulate("click");
        expect(wrapper.find(CreateResourceMetadata).exists()).toBeTruthy();
    });

    it("transitions to Resource detail on successful creation", () => {
        const wrapper = shallow<CreateResourceForm>(
            <CreateResourceForm
                createResource={createResource}
                createFile={createFile}
                uploadFileContent={uploadFileContent}
                publishNotification={publishNotification}
                onCancel={onCancel}
                onSuccess={onSuccess}
                justDocument={false}
                {...intlFunctions()}
            />
        );
        wrapper.instance().onCreate(new Resource({iri, label: "Test"}));
        return Promise.resolve().then(() => {
            return Promise.resolve().then(() => {
                expect(onSuccess).toHaveBeenCalledWith(iri, iri);
            });
        });
    });

    it("returns resolved identifier on successful creation", () => {
        const wrapper = shallow<CreateResourceForm>(
            <CreateResourceForm
                createResource={createResource}
                createFile={createFile}
                uploadFileContent={uploadFileContent}
                publishNotification={publishNotification}
                onCancel={onCancel}
                onSuccess={onSuccess}
                justDocument={false}
                {...intlFunctions()}
            />
        );
        return wrapper
            .instance()
            .onCreate(new Resource({iri, label: "Test"}))
            .then(result => {
                expect(result).toBeDefined();
                expect(result).toEqual(iri);
            });
    });
});
