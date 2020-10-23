import * as React from "react";
import Term, {CONTEXT} from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import {TermMetadataEdit} from "../TermMetadataEdit";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Ajax from "../../../util/Ajax";
import {shallow} from "enzyme";
import UnmappedPropertiesEdit from "../../genericmetadata/UnmappedPropertiesEdit";
import VocabularyUtils from "../../../util/VocabularyUtils";
import CustomInput from "../../misc/CustomInput";
import {getLocalized, langString, pluralLangString} from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import TextArea from "../../misc/TextArea";
import StringListEdit from "../../misc/StringListEdit";

jest.mock("../TermAssignments");
jest.mock("../ParentTermSelector");
jest.mock("../TermTypesEdit");
jest.mock("../../misc/AssetLabel");

describe("Term edit", () => {

    let term: Term;
    let onSave: (t: Term) => void;
    let onCancel: () => void;

    beforeEach(() => {
        term = new Term({
            iri: Generator.generateUri(),
            label: langString("Test"),
            comment: "test",
            vocabulary: {iri: Generator.generateUri()}
        });
        onSave = jest.fn();
        onCancel = jest.fn();
    });


    it("disables save button when label field is empty", () => {
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(true));
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                                    language={Constants.DEFAULT_LANGUAGE} {...intlFunctions()}/>);
        return Promise.resolve().then(() => {
            wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "edit-term-label").simulate("change", {
                currentTarget: {
                    name: "edit-term-label",
                    value: ""
                }
            });
            const saveButton = wrapper.find("#edit-term-submit");
            expect(saveButton.prop("disabled")).toBeTruthy();
        });
    });

    it("invokes save with state data when save is clicked", () => {
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(false));
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                  language={Constants.DEFAULT_LANGUAGE}{...intlFunctions()}/>);
        const newLabel = "New label";
        wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "edit-term-label").simulate("change", {
            currentTarget: {
                name: "edit-term-label",
                value: newLabel
            }
        });
        return Promise.resolve().then(() => {
            wrapper.find("#edit-term-submit").simulate("click");
            expect(onSave).toHaveBeenCalled();
            const arg = (onSave as jest.Mock).mock.calls[0][0];
            expect(arg.iri).toEqual(term.iri);
            expect(arg.label).toEqual(langString(newLabel));
            expect(arg.comment).toEqual(term.comment);
        });
    });

    it("checks for label uniqueness in vocabulary on label change", () => {
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                  language={Constants.DEFAULT_LANGUAGE}{...intlFunctions()}/>);
        const mock = jest.fn().mockImplementation(() => Promise.resolve(true));
        Ajax.get = mock;
        const newLabel = "New label";
        wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "edit-term-label").simulate("change", {
            currentTarget: {
                name: "edit-term-label",
                value: newLabel
            }
        });
        return Promise.resolve().then(() => {
            expect(Ajax.get).toHaveBeenCalled();
            expect(mock.mock.calls[0][1].getParams().value).toEqual(newLabel);
        });
    });

    it("does not check for label uniqueness when new label is the same as original", () => {
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                  language={Constants.DEFAULT_LANGUAGE} {...intlFunctions()}/>);
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(true));
        wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "edit-term-label").simulate("change", {
            currentTarget: {
                name: "edit-term-label",
                value: getLocalized(term.label)
            }
        });
        expect(Ajax.get).not.toHaveBeenCalled();
    });

    it("merges existing label value in a different language with edited value", () => {
        const czechValue = "Test in Czech";
        const englishValue = "Test in English";
        term.label.cs = czechValue;
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                                    language="en" {...intlFunctions()}/>);
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(false));
        wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "edit-term-label").simulate("change", {
            currentTarget: {
                name: "edit-term-label",
                value: englishValue
            }
        });
        wrapper.update();
        expect(wrapper.state().label).toEqual({cs: czechValue, en: englishValue});
    });

    it("merges existing definition value in a different language with edited value", () => {
        const czechValue = "Term definition in Czech";
        const englishValue = "Term definition in English";
        term.definition = {cs: czechValue};
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                                    language="en" {...intlFunctions()}/>);
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(false));
        wrapper.instance().onDefinitionChange({
            currentTarget: {
                name: "edit-term-definition",
                value: englishValue
            }
        } as any);
        wrapper.update();
        expect(wrapper.state().definition).toEqual({cs: czechValue, en: englishValue});
    });

    /**
     * Bug 1323
     */
    it("does not check for label uniqueness when new label differs only in case from original", () => {
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                  language={Constants.DEFAULT_LANGUAGE}{...intlFunctions()}/>);
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(true));
        wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "edit-term-label").simulate("change", {
            currentTarget: {
                name: "edit-term-label",
                value: getLocalized(term.label).toUpperCase()
            }
        });
        expect(Ajax.get).not.toHaveBeenCalled();
    });

    it("disables save button when duplicate label is set", () => {
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                  language={Constants.DEFAULT_LANGUAGE}{...intlFunctions()}/>);
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(true));
        wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "edit-term-label").simulate("change", {
            currentTarget: {
                name: "edit-term-label",
                value: "New label"
            }
        });
        return Promise.resolve().then(() => {
            wrapper.update();
            const saveButton = wrapper.find("#edit-term-submit");
            expect(saveButton.getElement().props.disabled).toBeTruthy();
        });
    });

    it("correctly sets unmapped properties on save", () => {
        const property = Generator.generateUri();
        term.unmappedProperties = new Map([[property, ["test"]]]);
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit term={term} save={onSave} cancel={onCancel}
                                                                    language={Constants.DEFAULT_LANGUAGE} {...intlFunctions()}/>);
        const updatedProperties = new Map([[property, ["test1", "test2"]]]);
        wrapper.instance().setState({unmappedProperties: updatedProperties});
        (wrapper.instance()).onSave();
        const result: Term = (onSave as jest.Mock).mock.calls[0][0];
        expect(result.unmappedProperties).toEqual(updatedProperties);
        expect(result[property]).toBeDefined();
        expect(result[property]).toEqual(updatedProperties.get(property));
    });

    it("passes mapped Term properties for ignoring to UnmappedPropertiesEdit", () => {
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                                    language={Constants.DEFAULT_LANGUAGE} {...intlFunctions()}/>);
        const ignored: string[] | undefined = wrapper.find(UnmappedPropertiesEdit).prop("ignoredProperties");
        expect(ignored).toBeDefined();
        expect(ignored!.indexOf(VocabularyUtils.RDF_TYPE)).not.toEqual(-1);
        Object.getOwnPropertyNames((n: string) => expect(ignored![CONTEXT[n]]).not.toEqual(-1));
    });

    it("passes label value in selected language to label edit input", () => {
        term.label = {"en": "Building", "cs": "Budova"};
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                                    language={"en"} {...intlFunctions()}/>);
        const labelInput = wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "edit-term-label");
        expect(labelInput.prop("value")).toEqual(term.label.en);
    });

    it("passes definition value in selected language to definition edit textarea", () => {
        term.definition = {"en": "Building is a kind of construction", "cs": "Budova je typem stavby"};
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                                    language={"cs"} {...intlFunctions()}/>);
        const definitionInput = wrapper.find(TextArea).findWhere(ci => ci.prop("name") === "edit-term-definition");
        expect(definitionInput.prop("value")).toEqual(term.definition.cs);
    });

    it("passes altLabel and hiddenLabel values in selected language to string list edit", () => {
        term.altLabels = {"en": ["building", "construction"], "cs": ["budova", "stavba"]};
        term.hiddenLabels = {"en": ["shack"], "cs": ["barák", "dům"]};
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                                    language={"cs"} {...intlFunctions()}/>);
        const stringListEdits = wrapper.find(StringListEdit);
        expect(stringListEdits.at(0).prop("list")).toEqual(term.altLabels.cs);
        expect(stringListEdits.at(1).prop("list")).toEqual(term.hiddenLabels.cs);
    });

    it("maps list of string alt labels to multilingual strings with selected language", () => {
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                                    language={"cs"} {...intlFunctions()}/>);
        const list = ["budova", "stavba"];
        wrapper.instance().onAltLabelsChange(list);
        wrapper.update();
        expect(wrapper.state().altLabels).toEqual(pluralLangString(list, "cs"));
    });

    it("maps list of string hidden labels to multilingual strings with selected language", () => {
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term} cancel={onCancel}
                                                                    language={"de"} {...intlFunctions()}/>);
        const list = ["bau", "gebäude"];
        wrapper.instance().onHiddenLabelsChange(list);
        wrapper.update();
        expect(wrapper.state().hiddenLabels).toEqual(pluralLangString(list, "de"));
    });
});
