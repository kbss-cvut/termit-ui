import * as React from "react";
import Document from "../../../../model/Document";
import Generator from "../../../../__tests__/environment/Generator";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import File from "../../../../model/File";
import VocabularyUtils, {IRI} from "../../../../util/VocabularyUtils";
import Resource from "../../../../model/Resource";
import {DocumentSummary} from "../DocumentSummary";
import {shallow} from "enzyme";

jest.mock("../../ResourceTermAssignments");
jest.mock("../../../misc/AssetIriLink");

describe("DocumentSummary", () => {

    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/resources/";
    const resourceName = "test-document";

    let loadResource: (iri: IRI) => Promise<any>;
    let saveResource: (resource: Resource) => Promise<any>;
    let removeResource: (resource: Resource) => Promise<any>;

    let resourceHandlers: any;

    let doc: Document;

    beforeEach(() => {
        loadResource = jest.fn().mockImplementation(() => Promise.resolve());
        saveResource = jest.fn().mockImplementation(() => Promise.resolve());
        removeResource = jest.fn().mockImplementation(() => Promise.resolve());
        resourceHandlers = {
            loadResource,
            saveResource,
            removeResource
        };
        doc = new Document({
            iri: namespace + resourceName,
            label: resourceName,
            files: [],
            types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE]
        });
    });

    it("does not render remove button for Document containing files", () => {
        doc.files = [new File({iri: Generator.generateUri(), label: "test.html"})];
        const wrapper = shallow<DocumentSummary>(<DocumentSummary
            resource={doc} {...resourceHandlers} {...intlFunctions()}/>);
        expect(wrapper.exists("button#resource-detail-remove")).toBeFalsy();
    });

    it("reloads document when file was added into it", () => {
        const wrapper = shallow<DocumentSummary>(<DocumentSummary
            resource={doc} {...resourceHandlers} {...intlFunctions()}/>);
        wrapper.instance().reload();
        expect(loadResource).toHaveBeenCalledWith(VocabularyUtils.create(doc.iri));
    });
});
