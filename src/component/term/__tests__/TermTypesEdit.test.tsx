import * as React from "react";
import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {TermTypesEdit} from "../TermTypesEdit";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import intlData from "../../../i18n/en";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import Generator from "../../../__tests__/environment/Generator";
import {shallow} from "enzyme";
import {langString} from "../../../model/MultilingualString";

describe("TermTypesEdit", () => {
    let onChange: (types: string[]) => void;
    let loadTypes: () => void;

    beforeEach(() => {
        onChange = jest.fn();
        loadTypes = jest.fn();
    });

    it("does not render implicit term type in the selector when no other type is assigned to term", () => {
        const availableTypes = {};
        availableTypes[VocabularyUtils.TERM] = new Term({iri: VocabularyUtils.TERM, label: langString("Term")});
        const types = [VocabularyUtils.TERM];
        const wrapper = mountWithIntl(<TermTypesEdit termTypes={types} availableTypes={availableTypes} intl={intlData}
                                                     loadTypes={loadTypes} onChange={onChange} {...intlFunctions()}/>);
        const selector = wrapper.find(IntelligentTreeSelect);
        expect(selector.prop("value")).not.toBeDefined();
    });

    it("does not render implicit term type in the selector when other another type is present as well", () => {
        const iri = Generator.generateUri();
        const availableTypes = {};
        availableTypes[VocabularyUtils.TERM] = new Term({iri: VocabularyUtils.TERM, label: langString("Term")});
        availableTypes[iri] = new Term({iri, label: langString("Other type")});
        const types = [VocabularyUtils.TERM, iri];
        const wrapper = shallow(<TermTypesEdit termTypes={types} availableTypes={availableTypes} intl={intlData}
                                               loadTypes={loadTypes} onChange={onChange} {...intlFunctions()}/>);
        const selector = wrapper.find(IntelligentTreeSelect);
        expect(selector.prop("value")).toEqual(availableTypes[iri].iri);
    });

    it("invokes onChange handler with selected type and the implicit Term type", () => {
        const selected = new Term({iri: Generator.generateUri(), label: langString("Selected term")});
        const wrapper = shallow(<TermTypesEdit termTypes={[VocabularyUtils.TERM]} availableTypes={{}} intl={intlData}
                                               loadTypes={loadTypes} onChange={onChange} {...intlFunctions()}/>);
        (wrapper.instance() as TermTypesEdit).onChange(selected);
        expect(onChange).toHaveBeenCalled();
        const newTypes = (onChange as jest.Mock).mock.calls[0][0];
        expect(newTypes.length).toEqual(2);
        expect(newTypes.indexOf(selected.iri)).not.toEqual(-1);
        expect(newTypes.indexOf(VocabularyUtils.TERM)).not.toEqual(-1);
    });

    it("invokes onChange handler with implicit Term type only when reset button is clicked", () => {
        const iri = Generator.generateUri();
        const availableTypes = {};
        availableTypes[VocabularyUtils.TERM] = new Term({iri: VocabularyUtils.TERM, label: langString("Term")});
        availableTypes[iri] = new Term({iri, label: langString("Other type")});
        const types = [VocabularyUtils.TERM, iri];
        const wrapper = shallow<TermTypesEdit>(<TermTypesEdit termTypes={types} availableTypes={availableTypes}
                                                              loadTypes={loadTypes} intl={intlData}
                                                              onChange={onChange} {...intlFunctions()}/>);
        // Simulate tree reset (using the real component did not work)
        wrapper.instance().onChange(null);
        expect(onChange).toHaveBeenCalledWith([VocabularyUtils.TERM]);
    });

    it("loads types on mount", () => {
        shallow(<TermTypesEdit termTypes={[VocabularyUtils.TERM]} availableTypes={{}} intl={intlData}
                               loadTypes={loadTypes} onChange={onChange} {...intlFunctions()}/>);
        expect(loadTypes).toHaveBeenCalled();
    });
});
