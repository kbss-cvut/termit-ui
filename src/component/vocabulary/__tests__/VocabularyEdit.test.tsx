import * as React from "react";
import {VocabularyEdit} from "../VocabularyEdit";
import Vocabulary, {CONTEXT} from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {shallow} from "enzyme";
import {UnmappedPropertiesEdit} from "../../genericmetadata/UnmappedPropertiesEdit";
import VocabularyUtils from "../../../util/VocabularyUtils";

describe("VocabularyEdit", () => {

    let onSave: (vocabulary: Vocabulary) => void;
    let onCancel: () => void;
    let vocabulary: Vocabulary;

    beforeEach(() => {
        onSave = jest.fn();
        onCancel = jest.fn();
        vocabulary = new Vocabulary({
            iri: Generator.generateUri(),
            label: "Test vocabulary"
        });
    });

    it("passes updated vocabulary to onSave", () => {
        const wrapper = mountWithIntl(<VocabularyEdit vocabulary={vocabulary} save={onSave} cancel={onCancel}
                                                      {...intlFunctions()}/>);
        const nameInput = wrapper.find("input[name='edit-vocabulary-label']");
        const newName = "Metropolitan plan";
        (nameInput.getDOMNode() as HTMLInputElement).value = newName;
        nameInput.simulate("change", nameInput);
        wrapper.find("button#edit-vocabulary-submit").simulate("click");
        expect(onSave).toHaveBeenCalled();
        const arg = (onSave as jest.Mock).mock.calls[0][0];
        expect(arg).not.toEqual(vocabulary);
        expect(arg.iri).toEqual(vocabulary.iri);
        expect(arg.label).toEqual(newName);
    });

    it("supports updating comment on vocabulary", () => {
        const wrapper = mountWithIntl(<VocabularyEdit vocabulary={vocabulary} save={onSave} cancel={onCancel}
                                                      {...intlFunctions()}/>);
        const commentInput = wrapper.find("textarea[name='edit-vocabulary-comment']");
        const newComment = "Updated comment";
        (commentInput.getDOMNode() as HTMLInputElement).value = newComment;
        commentInput.simulate("change", commentInput);
        wrapper.find("button#edit-vocabulary-submit").simulate("click");
        expect(onSave).toHaveBeenCalled();
        const arg = (onSave as jest.Mock).mock.calls[0][0];
        expect(arg.comment).toEqual(newComment);
    });

    it("closes editing view on when clicking on cancel", () => {
        const wrapper = mountWithIntl(<VocabularyEdit vocabulary={vocabulary} save={onSave} cancel={onCancel}
                                                      {...intlFunctions()}/>);
        wrapper.find("button#edit-vocabulary-cancel").simulate("click");
        expect(onCancel).toHaveBeenCalled();
    });

    it("correctly sets unmapped properties on save", () => {
        const property = Generator.generateUri();
        vocabulary.unmappedProperties = new Map([[property, ["test"]]]);
        const wrapper = shallow<VocabularyEdit>(<VocabularyEdit vocabulary={vocabulary} save={onSave}
                                                                cancel={onCancel} {...intlFunctions()}/>);
        const updatedProperties = new Map([[property, ["test1", "test2"]]]);
        wrapper.instance().setState({unmappedProperties: updatedProperties});
        (wrapper.instance()).onSave();
        const result: Vocabulary = (onSave as jest.Mock).mock.calls[0][0];
        expect(result.unmappedProperties).toEqual(updatedProperties);
        expect(result[property]).toBeDefined();
        expect(result[property]).toEqual(updatedProperties.get(property));
    });

    it("passes mapped Term properties for ignoring to UnmappedPropertiesEdit", () => {
        const wrapper = mountWithIntl(<VocabularyEdit vocabulary={vocabulary} save={onSave} cancel={onCancel}
                                                      {...intlFunctions()}/>);
        const ignored = wrapper.find(UnmappedPropertiesEdit).prop("ignoredProperties");
        expect(ignored).toBeDefined();
        expect(ignored!.indexOf(VocabularyUtils.RDF_TYPE)).not.toEqual(-1);
        Object.getOwnPropertyNames((n: string) => expect(ignored![CONTEXT[n]]).not.toEqual(-1));
    });

    it("onChange updates component state", () => {
        const wrapper = shallow<VocabularyEdit>(<VocabularyEdit vocabulary={vocabulary} save={onSave}
                                                                cancel={onCancel} {...intlFunctions()}/>);
        const importedVocabularies = [{iri: Generator.generateUri()}];
        wrapper.instance().onChange({importedVocabularies});
        wrapper.update();
        expect(wrapper.instance().state.importedVocabularies).toEqual(importedVocabularies);
    });
});
