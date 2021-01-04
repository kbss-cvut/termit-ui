import * as React from "react";
import Resource from "../../../../model/Resource";
import Ajax from "../../../../util/Ajax";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import {shallow} from "enzyme";
import AppNotification from "../../../../model/AppNotification";
import NotificationType from "../../../../model/NotificationType";
import {CreateFileMetadataFull} from "../CreateFileMetadataFull";
import TermItFile from "../../../../model/File";
import {flushPromises} from "../../../../__tests__/environment/Environment";

jest.mock("../../../../util/Ajax", () => {
    const originalModule = jest.requireActual("../../../../util/Ajax");
    return {
        ...originalModule,
        default: jest.fn()
    };
});

describe("CreateFileMetadataFull", () => {

    const fileName = "test.html";
    const iri = "http://onto.fel.cvut.cz/ontologies/termit/resource/" + fileName;

    let file: File;
    let resource: TermItFile;

    let onCreate: (file: Resource, data?: any) => Promise<string>;
    let onCancel: () => void;
    let uploadFileContent: (fileIri: string, file: File) => Promise<any>;
    let publishNotification: (notification: AppNotification) => void;

    beforeEach(() => {
        Ajax.post = jest.fn().mockImplementation(() => Promise.resolve({data: iri}));
        onCreate = jest.fn().mockImplementation(() => Promise.resolve(iri));
        onCancel = jest.fn();
        uploadFileContent = jest.fn().mockImplementation(() => Promise.resolve());
        publishNotification = jest.fn();
        file = new File([""], "");
        resource = new TermItFile({
            iri,
            label: "label"
        })
    });

    it("uploads file content on resource creation success", async () => {
        const wrapper = shallow<CreateFileMetadataFull>(<CreateFileMetadataFull
            onCreate={onCreate}
            onCancel={onCancel}
            uploadFileContent={uploadFileContent}
            publishNotification={publishNotification}
            {...intlFunctions()}
        />);
        await flushPromises();
        await wrapper.instance().onCreate(resource, file);
        expect(uploadFileContent).toHaveBeenCalledWith(iri, file);
    });

    it("publishes notification when file content has been uploaded", async () => {
        const wrapper = shallow<CreateFileMetadataFull>(<CreateFileMetadataFull
            onCreate={onCreate}
            onCancel={onCancel}
            uploadFileContent={uploadFileContent}
            publishNotification={publishNotification}
            {...intlFunctions()}
        />);
        wrapper.instance().onCreate(resource, file);
        await flushPromises();
        return Promise.resolve()
            .then(() => {
            expect(publishNotification).toHaveBeenCalledWith({source: {type: NotificationType.FILE_CONTENT_UPLOADED}});
        });
    });
});

