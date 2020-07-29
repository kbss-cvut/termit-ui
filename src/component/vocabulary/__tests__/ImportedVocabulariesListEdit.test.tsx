import * as React from "react";
import Vocabulary from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {shallow} from "enzyme";
import {ImportedVocabulariesListEdit} from "../ImportedVocabulariesListEdit";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";

describe("ImportedVocabulariesListEdit", () => {

    let vocabularies: { [key: string]: Vocabulary };
    let vocabulary: Vocabulary;

    let onChange: (change: object) => void;

    beforeEach(() => {
        const vOne = new Vocabulary({
            iri: Generator.generateUri(),
            label: "Vocabulary One",
            types: [VocabularyUtils.VOCABULARY]
        });
        const vTwo = new Vocabulary({
            iri: Generator.generateUri(),
            label: "Vocabulary two",
            types: [VocabularyUtils.VOCABULARY]
        });
        vocabularies = {};
        vocabularies[vOne.iri] = vOne;
        vocabularies[vTwo.iri] = vTwo;
        vocabulary = new Vocabulary({
            iri: Generator.generateUri(),
            label: "Edited vocabulary"
        });
        vocabularies[vocabulary.iri] = vocabulary;
        onChange = jest.fn();
    });

    it("renders select without any value when no imported vocabularies are specified", () => {
        const wrapper = shallow(<ImportedVocabulariesListEdit vocabulary={vocabulary} vocabularies={vocabularies}
                                                              onChange={onChange} {...intlFunctions()}/>);
        expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual([]);
    });

    it("calls onChange with selected vocabularies IRIs on vocabulary selection", () => {
        const vocabularyArray = Object.keys(vocabularies).map((v) => vocabularies[v]);
        const wrapper = shallow<ImportedVocabulariesListEdit>(<ImportedVocabulariesListEdit vocabulary={vocabulary}
                                                                                            vocabularies={vocabularies}
                                                                                            onChange={onChange} {...intlFunctions()}/>);
        wrapper.instance().onChange(vocabularyArray);
        expect(onChange).toHaveBeenCalledWith({importedVocabularies: vocabularyArray.map(v => ({iri: v.iri}))});
    });

    it("calls onChange with empty array when vocabulary selector is reset", () => {
        const selected = Object.keys(vocabularies).map(k => ({iri: k}));
        const wrapper = shallow<ImportedVocabulariesListEdit>(<ImportedVocabulariesListEdit vocabulary={vocabulary}
                                                                                            vocabularies={vocabularies}
                                                                                            importedVocabularies={selected}
                                                                                            onChange={onChange} {...intlFunctions()}/>);
        wrapper.instance().onChange([]);
        expect(onChange).toHaveBeenCalledWith({importedVocabularies: []});
    });

    it("updates vocabulary selection when props are updated", () => {
        const wrapper = shallow<ImportedVocabulariesListEdit>(<ImportedVocabulariesListEdit vocabulary={vocabulary}
                                                                                            vocabularies={vocabularies}
                                                                                            onChange={onChange} {...intlFunctions()}/>);
        expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual([]);
        const newSelected = [{iri: Object.keys(vocabularies)[0]}];
        wrapper.setProps({importedVocabularies: newSelected});
        wrapper.update();
        expect(wrapper.find(IntelligentTreeSelect).prop("value")).toEqual([newSelected[0].iri]);
    });

    it("does not offer the vocabulary itself for importing", () => {
        const wrapper = shallow(<ImportedVocabulariesListEdit vocabulary={vocabulary} vocabularies={vocabularies}
                                                              onChange={onChange} {...intlFunctions()}/>);
        const options: Vocabulary[] = wrapper.find(IntelligentTreeSelect).prop("options");
        expect(options.find(v => v.iri === vocabulary.iri)).not.toBeDefined();
    });
});
