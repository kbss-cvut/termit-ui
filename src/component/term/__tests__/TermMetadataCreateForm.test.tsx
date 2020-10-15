import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import {shallow} from "enzyme";
import {TermMetadataCreateForm} from "../TermMetadataCreateForm";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Ajax from "../../../util/Ajax";
import VocabularyUtils from "../../../util/VocabularyUtils";
import AssetFactory from "../../../util/AssetFactory";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import CustomInput from "../../misc/CustomInput";
import {getLocalized, langString, pluralLangString} from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import TextArea from "../../misc/TextArea";
import StringListEdit from "../../misc/StringListEdit";

jest.mock("../TermAssignments");
jest.mock("../ParentTermSelector");
jest.mock("../../misc/AssetLabel");
jest.mock("../TermTypesEdit");

jest.mock("../../../util/Ajax", () => {
    const originalModule = jest.requireActual("../../../util/Ajax");
    return {
        ...originalModule,
        default: jest.fn()
    };
});

describe("TermMetadataCreateForm", () => {

    const vocabularyIri = Generator.generateUri();

    let onChange: (change: object, callback?: () => void) => void;

    beforeEach(() => {
        onChange = jest.fn();
    });

    it("generates identifier on mount if a valid label is provided", () => {
        Ajax.get = jest.fn().mockResolvedValue(Generator.generateUri());
        const termData = {label: langString("test label")};
        shallow<TermMetadataCreateForm>(<TermMetadataCreateForm onChange={onChange} termData={termData}
                                                                language={Constants.DEFAULT_LANGUAGE}
                                                                vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        expect(Ajax.get).toHaveBeenCalled();
        const config = (Ajax.get as jest.Mock).mock.calls[0][1];
        expect(config.getParams().name).toEqual(getLocalized(termData.label));
        expect(config.getParams().namespace).toEqual(VocabularyUtils.create(vocabularyIri).namespace);
    });

    it("generates identifier on label change for non-empty label", () => {
        Ajax.get = jest.fn().mockResolvedValue(Generator.generateUri());
        const wrapper = mountWithIntl(<TermMetadataCreateForm onChange={onChange} language={Constants.DEFAULT_LANGUAGE}
                                                              termData={AssetFactory.createEmptyTermData()}
                                                              vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        const labelInput = wrapper.find("input[name=\"create-term-label\"]");
        (labelInput.getDOMNode() as HTMLInputElement).value = "a";
        labelInput.simulate("change", labelInput);
        expect(Ajax.get).toHaveBeenCalled();
        const idCall = (Ajax.get as jest.Mock).mock.calls.find((c: any[]) => c[0].endsWith("/identifier"));
        expect(idCall).toBeDefined();
        expect(idCall[1].getParams().name).toEqual("a");

    });

    it("correctly passes selected parent terms to onChange handler", () => {
        const wrapper = shallow<TermMetadataCreateForm>(<TermMetadataCreateForm onChange={onChange}
                                                                                language={Constants.DEFAULT_LANGUAGE}
                                                                                termData={AssetFactory.createEmptyTermData()}
                                                                                vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        const parents = [Generator.generateTerm()];
        wrapper.instance().onParentSelect(parents);
        expect(onChange).toHaveBeenCalledWith({parentTerms: parents});
    });

    it("checks for label uniqueness in vocabulary on label change", () => {
        const wrapper = shallow<TermMetadataCreateForm>(<TermMetadataCreateForm onChange={onChange}
                                                                                language={Constants.DEFAULT_LANGUAGE}
                                                                                termData={AssetFactory.createEmptyTermData()}
                                                                                vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        const mock = jest.fn().mockImplementation(() => Promise.resolve(true));
        Ajax.get = mock;
        const newLabel = "New label";
        wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "create-term-label").simulate("change", {
            currentTarget: {
                name: "create-term-label",
                value: newLabel
            }
        });
        return Promise.resolve().then(() => {
            // Label check, identifier generation
            expect(Ajax.get).toHaveBeenCalledTimes(2);
            expect(mock.mock.calls[1][1].getParams().value).toEqual(newLabel);
        });
    });

    it("does not check for label uniqueness for empty label", () => {
        const wrapper = shallow<TermMetadataCreateForm>(<TermMetadataCreateForm onChange={onChange}
                                                                                language={Constants.DEFAULT_LANGUAGE}
                                                                                termData={AssetFactory.createEmptyTermData()}
                                                                                vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(true));
        wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "create-term-label").simulate("change", {
            currentTarget: {
                name: "create-term-label",
                value: ""
            }
        });
        return Promise.resolve().then(() => {
            // Label check, identifier generation
            expect(Ajax.get).not.toHaveBeenCalled();
        });
    });

    it("passes existing label value in selected language to label edit input", () => {
        Ajax.get = jest.fn().mockResolvedValue(Generator.generateUri());
        const termData = AssetFactory.createEmptyTermData();
        termData.label = {"en": "Building", "cs": "Budova"};
        const wrapper = shallow<TermMetadataCreateForm>(<TermMetadataCreateForm onChange={onChange}
                                                                                language={"en"}
                                                                                termData={termData}
                                                                                vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        const labelInput = wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "create-term-label");
        expect(labelInput.prop("value")).toEqual(termData.label.en);
    });

    it("passes definition value in selected language to definition edit textarea", () => {
        const termData = AssetFactory.createEmptyTermData();
        termData.definition = {"en": "Building is a kind of construction", "cs": "Budova je typem stavby"};
        const wrapper = shallow<TermMetadataCreateForm>(<TermMetadataCreateForm onChange={onChange}
                                                                                language={"cs"}
                                                                                termData={termData}
                                                                                vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        const definitionInput = wrapper.find(TextArea).findWhere(ci => ci.prop("name") === "create-term-definition");
        expect(definitionInput.prop("value")).toEqual(termData.definition.cs);
    });

    it("passes altLabel and hiddenLabel values in selected language to string list edit", () => {
        const termData = AssetFactory.createEmptyTermData();
        termData.altLabels = {"en": ["building", "construction"], "cs": ["budova", "stavba"]};
        termData.hiddenLabels = {"en": ["shack"], "cs": ["barák", "dům"]};
        const wrapper = shallow<TermMetadataCreateForm>(<TermMetadataCreateForm onChange={onChange}
                                                                                language={"cs"}
                                                                                termData={termData}
                                                                                vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        const stringListEdits = wrapper.find(StringListEdit);
        expect(stringListEdits.at(0).prop("list")).toEqual(termData.altLabels.cs);
        expect(stringListEdits.at(1).prop("list")).toEqual(termData.hiddenLabels.cs);
    });

    it("maps list of string alt labels to multilingual strings with selected language", () => {
        const wrapper = shallow<TermMetadataCreateForm>(<TermMetadataCreateForm onChange={onChange}
                                                                                language={"cs"}
                                                                                termData={AssetFactory.createEmptyTermData("cs")}
                                                                                vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        const list = ["budova", "stavba"];
        wrapper.instance().onAltLabelsChange(list);
        expect(onChange).toHaveBeenCalledWith({altLabels: pluralLangString(list, "cs")});
    });

    it("maps list of string hidden labels to multilingual strings with selected language", () => {
        const wrapper = shallow<TermMetadataCreateForm>(<TermMetadataCreateForm onChange={onChange}
                                                                                language={"de"}
                                                                                termData={AssetFactory.createEmptyTermData("de")}
                                                                                vocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        const list = ["bau", "gebäude"];
        wrapper.instance().onHiddenLabelsChange(list);
        expect(onChange).toHaveBeenCalledWith({hiddenLabels: pluralLangString(list, "de")});
    });
});
