import * as React from "react";
import Routing from "../../../util/Routing";
import {CreateVocabulary} from "../CreateVocabulary";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Routes from "../../../util/Routes";
import Ajax, {params} from "../../../util/Ajax";
import Vocabulary from "../../../model/Vocabulary";
import {shallow} from "enzyme";
import {flushPromises, mountWithIntl} from "../../../__tests__/environment/Environment";
import Constants from "../../../util/Constants";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Document from "../../../model/Document";
import TermItFile from "../../../model/File";
import AppNotification from "../../../model/AppNotification";

jest.mock("../../../util/Routing");
jest.mock("../../../util/Ajax", () => {
    const originalModule = jest.requireActual("../../../util/Ajax");
    return {
        ...originalModule,
        default: jest.fn()
    };
});

describe("Create vocabulary view", () => {

    const iri = "http://onto.fel.cvut.cz/ontologies/termit/vocabulary/test";

    let createVocabulary: (vocabulary: Vocabulary) => Promise<any>;
    let createFile: (file: TermItFile, documentIri : string) => Promise<any>;
    let uploadFileContent: (fileIri : string, file: File) => Promise<any>;
    let publishNotification: (notification: AppNotification) => void;

    beforeEach(() => {
        Ajax.post = jest.fn().mockImplementation(() => Promise.resolve({ data : iri }));
        createVocabulary = jest.fn().mockImplementation( () => Promise.resolve() );
        createFile = jest.fn();
        uploadFileContent = jest.fn();
        publishNotification = jest.fn();
    });

    it("returns to Vocabulary Management on cancel", () => {
        shallow<CreateVocabulary>(<CreateVocabulary createVocabulary={createVocabulary}
                                                    createFile={createFile}
                                                    uploadFileContent={uploadFileContent}
                                                    publishNotification={publishNotification}
                                                    {...intlFunctions()}/>);
        CreateVocabulary.onCancel();
        expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.vocabularies);
    });

    it("enables submit button only when name is not empty", () => {
        const wrapper = mountWithIntl(<CreateVocabulary createVocabulary={createVocabulary}
                                                        createFile={createFile}
                                                        uploadFileContent={uploadFileContent}
                                                        publishNotification={publishNotification}
                                                        {...intlFunctions()}/>);
        let submitButton = wrapper.find("#create-vocabulary-submit").first();
        expect(submitButton.getElement().props.disabled).toBeTruthy();
        const nameInput = wrapper.find("input[name=\"create-vocabulary-label\"]");
        (nameInput.getDOMNode() as HTMLInputElement).value = "Metropolitan Plan";
        nameInput.simulate("change", nameInput);
        submitButton =  wrapper.find("#create-vocabulary-submit").first();
        expect(submitButton.getElement().props.disabled).toBeFalsy();
    });

    it("calls onCreate on submit click", () => {
        const wrapper = mountWithIntl(<CreateVocabulary createVocabulary={createVocabulary}
                                                        createFile={createFile}
                                                        uploadFileContent={uploadFileContent}
                                                        publishNotification={publishNotification}
                                                        {...intlFunctions()}/>);
        const nameInput = wrapper.find("input[name=\"create-vocabulary-label\"]");
        (nameInput.getDOMNode() as HTMLInputElement).value = "Metropolitan Plan";
        nameInput.simulate("change", nameInput);
        return Ajax.post(Constants.API_PREFIX + "/identifiers", params({name: "", assetType: "VOCABULARY"})).then(() => {
            const submitButton = wrapper.find("#create-vocabulary-submit").first();
            submitButton.simulate("click");
            expect(createVocabulary).toHaveBeenCalled();
        });
    });

    it("passes state representing new vocabulary to vocabulary creation handler on submit", () => {
        const wrapper = shallow<CreateVocabulary>(<CreateVocabulary createVocabulary={createVocabulary}
                                                                    createFile={createFile}
                                                                    uploadFileContent={uploadFileContent}
                                                                    publishNotification={publishNotification}
                                                                    {...intlFunctions()}/>);
        const label = "Test vocabulary";
        const comment = "Test vocabulary comment";
        const types = [VocabularyUtils.VOCABULARY,VocabularyUtils.DOCUMENT_VOCABULARY];

        const docIri = iri + "/document";
        const docLabel = "Document for Test vocabulary";
        const docTypes = [VocabularyUtils.RESOURCE, VocabularyUtils.DOCUMENT];
        const document = new Document({
            iri: docIri,
            label: docLabel,
            types: docTypes,
            files: []
        });
        wrapper.setState({iri, label, comment});
        wrapper.update();
        (wrapper.instance()).onCreate();
        expect(createVocabulary).toHaveBeenCalledWith(new Vocabulary({
            iri,
            label,
            comment,
            types,
            document
        }));
    });

    describe("IRI generation", () => {
        it("requests IRI generation when name changes", () => {
            const wrapper = mountWithIntl(<CreateVocabulary createVocabulary={createVocabulary}
                                                            createFile={createFile}
                                                            uploadFileContent={uploadFileContent}
                                                            publishNotification={publishNotification}
                                                            {...intlFunctions()}/>);
            const nameInput = wrapper.find("input[name=\"create-vocabulary-label\"]");
            const name = "Metropolitan Plan";
            (nameInput.getDOMNode() as HTMLInputElement).value = name;
            nameInput.simulate("change", nameInput);
            return Promise.resolve().then(() => {
                expect(Ajax.post).toHaveBeenCalledWith(Constants.API_PREFIX + "/identifiers", params({
                    name,
                    assetType: "VOCABULARY"})
                );
            });
        });

        it("does not request IRI generation when IRI value had been changed manually before", () => {
            const wrapper = mountWithIntl(<CreateVocabulary createVocabulary={createVocabulary}
                                                            createFile={createFile}
                                                            uploadFileContent={uploadFileContent}
                                                            publishNotification={publishNotification}
                                                            {...intlFunctions()}/>);
            const iriInput = wrapper.find("input[name=\"create-vocabulary-iri\"]");
            (iriInput.getDOMNode() as HTMLInputElement).value = "http://test";
            iriInput.simulate("change", iriInput);
            const nameInput = wrapper.find("input[name=\"create-vocabulary-label\"]");
            (nameInput.getDOMNode() as HTMLInputElement).value = "Metropolitan Plan";
            nameInput.simulate("change", nameInput);
            expect(Ajax.post).not.toHaveBeenCalled();
        });

        it("displays IRI generated and returned by the server", async () => {
            const wrapper = mountWithIntl(<CreateVocabulary createVocabulary={createVocabulary}
                                                            createFile={createFile}
                                                            uploadFileContent={uploadFileContent}
                                                            publishNotification={publishNotification}
                                                            {...intlFunctions()}/>);
            const nameInput = wrapper.find("input[name=\"create-vocabulary-label\"]");
            const name = "Metropolitan Plan";
            (nameInput.getDOMNode() as HTMLInputElement).value = name;
            nameInput.simulate("change", nameInput);
            await flushPromises();
            const iriInput = wrapper.find("input[name=\"create-vocabulary-iri\"]");
            return expect((iriInput.getDOMNode() as HTMLInputElement).value).toEqual(iri);
        });
    });
});
