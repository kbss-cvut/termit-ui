import * as React from "react";
import {shallow} from "enzyme";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import File from "../../../../model/File";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import Document from "../../../../model/Document";
import Generator from "../../../../__tests__/environment/Generator";
import {DocumentFiles} from "../DocumentFiles";

describe("DocumentFiles", () => {

    const fileName = "test.html";
    const fileIri = "http://onto.fel.cvut.cz/ontologies/termit/resource/" + fileName;

    let document: Document;

    let onFileAdded: () => void;
    let createFile: (file: File, documentIri: string) => Promise<any>;

    beforeEach(() => {
        document = new Document({
            iri: Generator.generateUri(),
            label: "Test document",
            files: [],
            types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE]
        });
        onFileAdded = jest.fn();
        createFile = jest.fn().mockImplementation(() => Promise.resolve());
    });

    it("adds file type to data submitted to create action", () => {
        const wrapper = shallow<DocumentFiles>(<DocumentFiles document={document} onFileAdded={onFileAdded}
                                                              createFile={createFile} {...intlFunctions()}/>);
        const file = new File({
            iri: fileIri,
            label: fileName
        });
        wrapper.instance().createFile(file);
        expect(createFile).toHaveBeenCalled();
        const args = (createFile as jest.Mock).mock.calls[0];
        expect(args[0].types.indexOf(VocabularyUtils.FILE)).not.toEqual(-1);
        expect(args[1]).toEqual(document.iri);
    });

    it("closes file creation dialog on successful creation", () => {
        const wrapper = shallow<DocumentFiles>(<DocumentFiles document={document} onFileAdded={onFileAdded}
                                                              createFile={createFile} {...intlFunctions()}/>);
        wrapper.instance().setState({createFileDialogOpen: true});
        const file = new File({
            iri: fileIri,
            label: fileName
        });
        wrapper.instance().createFile(file);
        return Promise.resolve().then(() => {
            expect(wrapper.instance().state.createFileDialogOpen).toBeFalsy();
        });
    });

    it("invokes onFileAdded handler on successful file creation", () => {
        const wrapper = shallow<DocumentFiles>(<DocumentFiles document={document} onFileAdded={onFileAdded}
                                                              createFile={createFile} {...intlFunctions()}/>);
        const file = new File({
            iri: fileIri,
            label: fileName
        });
        wrapper.instance().createFile(file);
        return Promise.resolve().then(() => {
            expect(onFileAdded).toHaveBeenCalled();
        });
    });
});
