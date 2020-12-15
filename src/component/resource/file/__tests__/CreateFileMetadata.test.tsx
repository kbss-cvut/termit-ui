import * as React from "react";
import Resource from "../../../../model/Resource";
import Ajax from "../../../../util/Ajax";
import {flushPromises, mountWithIntl} from "../../../../__tests__/environment/Environment";
import {CreateFileMetadata} from "../CreateFileMetadata";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import {shallow} from "enzyme";
import AppNotification from "../../../../model/AppNotification";
import NotificationType from "../../../../model/NotificationType";

jest.mock("../../../../util/Ajax", () => {
    const originalModule = jest.requireActual("../../../../util/Ajax");
    return {
        ...originalModule,
        default: jest.fn()
    };
});

describe("CreateFileMetadata", () => {

    const fileName = "test.html";
    const iri = "http://onto.fel.cvut.cz/ontologies/termit/resource/" + fileName;

    let file: Blob;

    let onCreate: (data: Resource) => Promise<string>;
    let onCancel: () => void;
    let uploadFile: (fileIri: string, file: File) => Promise<any>;
    let publishNotification: (notification: AppNotification) => void;

    beforeEach(() => {
        Ajax.post = jest.fn().mockImplementation(() => Promise.resolve({data: iri}));
        onCreate = jest.fn().mockImplementation(() => Promise.resolve(iri));
        onCancel = jest.fn();
        uploadFile = jest.fn().mockImplementation(() => Promise.resolve());
        publishNotification = jest.fn();
        file = new Blob([""], {type: "text/html"});
        // @ts-ignore
        file.name = fileName;
    });

    it("uses name of the selected file as label", () => {
        const wrapper = mountWithIntl(<CreateFileMetadata onCreate={onCreate} onCancel={onCancel}
                                                          uploadFileContent={uploadFile}
                                                          publishNotification={publishNotification} {...intlFunctions()}/>);
        (wrapper.find(CreateFileMetadata).instance() as CreateFileMetadata).setFile(file as File);
        const labelInput = wrapper.find("input[name=\"create-resource-label\"]");
        expect((labelInput.getDOMNode() as HTMLInputElement).value).toEqual(fileName);
    });

    it("generates identifier after label has been set based on selected file", async () => {
        const wrapper = mountWithIntl(<CreateFileMetadata onCreate={onCreate} onCancel={onCancel}
                                                          uploadFileContent={uploadFile}
                                                          publishNotification={publishNotification} {...intlFunctions()}/>);
        (wrapper.find(CreateFileMetadata).instance() as CreateFileMetadata).setFile(file as File);
        await flushPromises();
        expect(Ajax.post).toHaveBeenCalled();
        const iriInput = wrapper.find("input[name=\"create-resource-iri\"]");
        expect((iriInput.getDOMNode() as HTMLInputElement).value).toEqual(iri);
    });

    it("uploads file content on resource creation success", async () => {
        const wrapper = shallow<CreateFileMetadata>(<CreateFileMetadata onCreate={onCreate} onCancel={onCancel}
                                                                        uploadFileContent={uploadFile}
                                                                        publishNotification={publishNotification} {...intlFunctions()}/>);
        wrapper.instance().setFile(file as File);
        await flushPromises();
        await wrapper.instance().onCreate();
        expect(uploadFile).toHaveBeenCalledWith(iri, file);
    });

    it("does not attempt file upload when no file has been attached", () => {
        const wrapper = shallow<CreateFileMetadata>(<CreateFileMetadata onCreate={onCreate} onCancel={onCancel}
                                                                        uploadFileContent={uploadFile}
                                                                        publishNotification={publishNotification} {...intlFunctions()}/>);
        wrapper.instance().onCreate();
        return Promise.resolve().then(() => {
            expect(uploadFile).not.toHaveBeenCalled();
        });
    });

    it("publishes notification when file content has been uploaded", () => {
        const wrapper = shallow<CreateFileMetadata>(<CreateFileMetadata onCreate={onCreate} onCancel={onCancel}
                                                                        uploadFileContent={uploadFile}
                                                                        publishNotification={publishNotification} {...intlFunctions()}/>);
        wrapper.instance().setFile(file as File);
        wrapper.instance().onCreate();
        return Promise.resolve().then(() => {
            return Promise.resolve().then(() => {
                expect(publishNotification).toHaveBeenCalledWith({source: {type: NotificationType.FILE_CONTENT_UPLOADED}});
            });
        });
    });
});
