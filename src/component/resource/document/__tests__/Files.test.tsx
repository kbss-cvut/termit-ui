import * as React from "react";
import {shallow} from "enzyme";
import {mockUseI18n} from "../../../../__tests__/environment/IntlUtil";
import TermItFile from "../../../../model/File";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import Document from "../../../../model/Document";
import Generator from "../../../../__tests__/environment/Generator";
import {Files} from "../Files";

describe("DocumentFiles", () => {
    let document: Document;

    let actions: JSX.Element[];
    let itemActions: (file: TermItFile) => JSX.Element[];

    beforeEach(() => {
        document = new Document({
            iri: Generator.generateUri(),
            label: "Test document",
            files: [],
            types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE]
        });
        actions = [];
        itemActions = () => [];
        mockUseI18n();
    });

    it("renders notice when no Files exist", () => {
        const wrapper = shallow(<Files files={document.files} actions={actions} itemActions={itemActions} />);
        expect(wrapper.exists("#file-list-empty")).toBeTruthy();
    });
});
