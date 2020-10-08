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
import {getLocalized, langString} from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";

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
});
