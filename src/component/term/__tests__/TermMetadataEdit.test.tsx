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
import {getLocalized, langString} from "../../../model/MultilingualString";

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
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term}
                                                                    cancel={onCancel} {...intlFunctions()}/>);
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
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term}
                                                  cancel={onCancel} {...intlFunctions()}/>);
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
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term}
                                                  cancel={onCancel} {...intlFunctions()}/>);
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
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term}
                                                  cancel={onCancel} {...intlFunctions()}/>);
        Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(true));
        wrapper.find(CustomInput).findWhere(ci => ci.prop("name") === "edit-term-label").simulate("change", {
            currentTarget: {
                name: "edit-term-label",
                value: getLocalized(term.label)
            }
        });
        expect(Ajax.get).not.toHaveBeenCalled();
    });

    /**
     * Bug 1323
     */
    it("does not check for label uniqueness when new label differs only in case from original", () => {
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term}
                                                  cancel={onCancel} {...intlFunctions()}/>);
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
        const wrapper = shallow(<TermMetadataEdit save={onSave} term={term}
                                                  cancel={onCancel} {...intlFunctions()}/>);
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
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit term={term} save={onSave}
                                                                    cancel={onCancel} {...intlFunctions()}/>);
        const updatedProperties = new Map([[property, ["test1", "test2"]]]);
        wrapper.instance().setState({unmappedProperties: updatedProperties});
        (wrapper.instance()).onSave();
        const result: Term = (onSave as jest.Mock).mock.calls[0][0];
        expect(result.unmappedProperties).toEqual(updatedProperties);
        expect(result[property]).toBeDefined();
        expect(result[property]).toEqual(updatedProperties.get(property));
    });

    it("passes mapped Term properties for ignoring to UnmappedPropertiesEdit", () => {
        const wrapper = shallow<TermMetadataEdit>(<TermMetadataEdit save={onSave} term={term}
                                                                    cancel={onCancel} {...intlFunctions()}/>);
        const ignored: string[] | undefined = wrapper.find(UnmappedPropertiesEdit).prop("ignoredProperties");
        expect(ignored).toBeDefined();
        expect(ignored!.indexOf(VocabularyUtils.RDF_TYPE)).not.toEqual(-1);
        Object.getOwnPropertyNames((n: string) => expect(ignored![CONTEXT[n]]).not.toEqual(-1));
    });
});
