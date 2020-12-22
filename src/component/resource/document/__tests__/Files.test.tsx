import * as React from "react";
import {shallow} from "enzyme";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import TermItFile from "../../../../model/File";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import Document from "../../../../model/Document";
import Generator from "../../../../__tests__/environment/Generator";
import {Files} from "../Files";

describe("DocumentFiles", () => {

    const fileName = "test.html";
    const fileIri = "http://onto.fel.cvut.cz/ontologies/termit/resource/" + fileName;

    let document: Document;
    let file: File;

    let onFileAdded: () => void;
    let createFile: (termItFile: TermItFile, file: File) => Promise<void>;

    beforeEach(() => {
        document = new Document({
            iri: Generator.generateUri(),
            label: "Test document",
            files: [],
            types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE]
        });
        onFileAdded = jest.fn();
        file = new File([], "test");
        createFile = jest.fn().mockImplementation(() => Promise.resolve());
    });

    it("closes file creation dialog on successful creation", () => {
        const wrapper = shallow<Files>(<Files files={document.files}
                                              onFileAdded={onFileAdded}
                                              createFile={createFile}
                                              {...intlFunctions()}/>);
        wrapper.instance().setState({createFileDialogOpen: true});
        const termItFile = new TermItFile({
            iri: fileIri,
            label: fileName
        });
        wrapper.instance().createFile(termItFile, file);
        return Promise.resolve().then(() => {
            expect(wrapper.instance().state.createFileDialogOpen).toBeFalsy();
        });
    });

    it("adds file type to data submitted to create action", () => {
        const wrapper = shallow<Files>(<Files files={document.files}
                                              onFileAdded={onFileAdded}
                                              createFile={createFile}
                                              {...intlFunctions()}/>);
        const termItFile = new TermItFile({
            iri: fileIri,
            label: fileName
        });
        wrapper.instance().createFile(termItFile, file);
        expect(createFile).toHaveBeenCalled();
        const args = (createFile as jest.Mock).mock.calls[0];
        expect(args[0].types.indexOf(VocabularyUtils.FILE)).not.toEqual(-1);
        expect(args[1]).toEqual(file);
    });


    it("invokes onFileAdded handler on successful file creation", () => {
        const wrapper = shallow<Files>(<Files files={document.files}
                                              onFileAdded={onFileAdded}
                                              createFile={createFile} {...intlFunctions()}/>);
        const termItFile = new TermItFile({
            iri: fileIri,
            label: fileName
        });
        wrapper.instance().createFile(termItFile, file);
        return Promise.resolve().then(() => {
            expect(onFileAdded).toHaveBeenCalled();
        });
    });
});
