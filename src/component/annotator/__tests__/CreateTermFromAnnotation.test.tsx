import * as React from "react";
import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {shallow} from "enzyme";
import {CreateTermFromAnnotation} from "../CreateTermFromAnnotation";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {langString} from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";

describe("CreateTermFromAnnotation", () => {

    const vocabularyIri = VocabularyUtils.create(VocabularyUtils.NS_TERMIT + "test-vocabulary");

    let onClose: () => void;
    let onMinimize: () => void;
    let createTerm: (term: Term) => Promise<any>;
    let onTermCreated: (term: Term) => void;

    let propsFunctions: any;

    beforeEach(() => {
        onClose = jest.fn();
        onMinimize = jest.fn();
        createTerm = jest.fn().mockResolvedValue({});
        onTermCreated = jest.fn();
        propsFunctions = {onClose, onMinimize, createTerm, onTermCreated};
    });

    it("resets state before close", () => {
        const wrapper = shallow<CreateTermFromAnnotation>(<CreateTermFromAnnotation show={true}
                                                                                    language={Constants.DEFAULT_LANGUAGE}
                                                                                    vocabularyIri={vocabularyIri} {...propsFunctions} {...intlFunctions()}/>);
        wrapper.setState({iri: "http://test", label: langString("test")});
        wrapper.instance().onCancel();
        expect(onClose).toHaveBeenCalled();
        expect(wrapper.state().iri).toEqual("");
        expect(wrapper.state().label).toEqual(langString(""));
    });

    describe("setLabel", () => {
        it("sets label in state", () => {
            const wrapper = shallow<CreateTermFromAnnotation>(<CreateTermFromAnnotation show={true}
                                                                                        language={Constants.DEFAULT_LANGUAGE}
                                                                                        vocabularyIri={vocabularyIri} {...propsFunctions} {...intlFunctions()}/>);
            expect(wrapper.state().label).toEqual(langString(""));
            const label = "Test";
            wrapper.instance().setLabel(label);
            expect(wrapper.state().label).toEqual(langString(label, Constants.DEFAULT_LANGUAGE));
        });

        it("removes leading and trailing whitespaces from the specified label", () => {
            const wrapper = shallow<CreateTermFromAnnotation>(<CreateTermFromAnnotation show={true}
                                                                                        language={Constants.DEFAULT_LANGUAGE}
                                                                                        vocabularyIri={vocabularyIri} {...propsFunctions} {...intlFunctions()}/>);
            expect(wrapper.state().label).toEqual(langString(""));
            const label = "    Test    \n";
            wrapper.instance().setLabel(label);
            expect(wrapper.state().label).toEqual(langString(label.trim(), Constants.DEFAULT_LANGUAGE));
        });
    });

    describe("setDefinition", () => {
        it("sets definition in state", () => {
            const wrapper = shallow<CreateTermFromAnnotation>(<CreateTermFromAnnotation show={true}
                                                                                        language={Constants.DEFAULT_LANGUAGE}
                                                                                        vocabularyIri={vocabularyIri} {...propsFunctions} {...intlFunctions()}/>);
            expect(wrapper.state().definition).toEqual(langString("", Constants.DEFAULT_LANGUAGE));
            const definition = "Test definition";
            wrapper.instance().setDefinition(definition);
            expect(wrapper.state().definition).toEqual(langString(definition, Constants.DEFAULT_LANGUAGE));
        });

        it("removes leading and trailing whitespaces from the specified definition", () => {
            const wrapper = shallow<CreateTermFromAnnotation>(<CreateTermFromAnnotation show={true}
                                                                                        language={Constants.DEFAULT_LANGUAGE}
                                                                                        vocabularyIri={vocabularyIri} {...propsFunctions} {...intlFunctions()}/>);
            expect(wrapper.state().definition).toEqual(langString("", Constants.DEFAULT_LANGUAGE));
            const definition = "  Test definition \n";
            wrapper.instance().setDefinition(definition);
            expect(wrapper.state().definition).toEqual(langString(definition.trim(), Constants.DEFAULT_LANGUAGE));
        });
    });

    it("onSave creates new term from current state and saves it", () => {
        const wrapper = shallow<CreateTermFromAnnotation>(<CreateTermFromAnnotation show={true}
                                                                                    language={Constants.DEFAULT_LANGUAGE}
                                                                                    vocabularyIri={vocabularyIri} {...propsFunctions} {...intlFunctions()}/>);
        const iri = vocabularyIri + "/term/test-term";
        const label = langString("Test label");
        const sources = ["source.html", "http://onto.fel.cvut.cz"];
        wrapper.setState({iri, label, sources});
        wrapper.instance().onSave();
        expect(createTerm).toHaveBeenCalled();
        const term = (createTerm as jest.Mock).mock.calls[0][0];
        expect(term).toBeInstanceOf(Term);
        expect(term.iri).toEqual(iri);
        expect(term.label).toEqual(label);
        expect(term.sources).toEqual(sources);
        expect(term.types).toContain(VocabularyUtils.TERM);
        expect((createTerm as jest.Mock).mock.calls[0][1]).toEqual(vocabularyIri);
    });

    it("invokes close and clears state after successful term creation", async () => {
        const wrapper = shallow<CreateTermFromAnnotation>(<CreateTermFromAnnotation show={true}
                                                                                    language={Constants.DEFAULT_LANGUAGE}
                                                                                    vocabularyIri={vocabularyIri} {...propsFunctions} {...intlFunctions()}/>);
        wrapper.setState({iri: vocabularyIri + "/term/test-term", label: langString("Test term")});
        await wrapper.instance().onSave();
        expect(onClose).toHaveBeenCalled();
        expect(wrapper.state().iri).toEqual("");
        expect(wrapper.state().label).toEqual(langString(""));
    });

    // Bug #1463
    it("clears also alt labels and hidden labels from state after successful term creation", async () => {
        const wrapper = shallow<CreateTermFromAnnotation>(<CreateTermFromAnnotation show={true}
                                                                                    language={Constants.DEFAULT_LANGUAGE}
                                                                                    vocabularyIri={vocabularyIri} {...propsFunctions} {...intlFunctions()}/>);
        wrapper.setState({
            iri: vocabularyIri + "/term/test-term",
            label: langString("Test term"),
            altLabels: {en: ["test one", "test two"]},
            hiddenLabels: {en: ["hidden one", "hidden two"]}
        });
        await wrapper.instance().onSave();
        expect(onClose).toHaveBeenCalled();
        expect(wrapper.state().altLabels).not.toBeDefined();
        expect(wrapper.state().hiddenLabels).not.toBeDefined();
    })

    it("invokes onTermCreated with the new term after successful term creation", async () => {
        const termIri = vocabularyIri + "/term/test-term";
        const termLabel = langString("Test term");
        const wrapper = shallow<CreateTermFromAnnotation>(<CreateTermFromAnnotation show={true}
                                                                                    language={Constants.DEFAULT_LANGUAGE}
                                                                                    vocabularyIri={vocabularyIri} {...propsFunctions} {...intlFunctions()}/>);
        wrapper.setState({iri: termIri, label: termLabel});
        await wrapper.instance().onSave();
        expect(onTermCreated).toHaveBeenCalled();
        const newTerm = (onTermCreated as jest.Mock).mock.calls[0][0];
        expect(newTerm.iri).toEqual(termIri);
        expect(newTerm.label).toEqual(termLabel);
    });
});
