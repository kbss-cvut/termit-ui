import * as React from "react";
import File from "../../../../model/File";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import Generator from "../../../../__tests__/environment/Generator";
import {shallow} from "enzyme";
import {TextAnalysisInvocationButton} from "../TextAnalysisInvocationButton";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import {InjectsLoading} from "../../../hoc/withInjectableLoading";
import ResourceSelectVocabulary from "../../ResourceSelectVocabulary";
import Vocabulary from "../../../../model/Vocabulary";

describe("TextAnalysisInvocationButton", () => {

    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/resources/";
    const fileName = "test.html";

    let file: File;

    let executeTextAnalysis: (file: File, vocabularyIri?: string) => Promise<any>;
    let notifyAnalysisFinish: () => void;
    let loadingOn: () => void;
    let loadingOff: () => void;
    let renderMask: () => JSX.Element | null;

    let loadingProps: InjectsLoading;

    beforeEach(() => {
        file = new File({
            iri: namespace + fileName,
            label: fileName,
            types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE]
        });
        executeTextAnalysis = jest.fn().mockImplementation(() => Promise.resolve());
        notifyAnalysisFinish = jest.fn();
        loadingOn = jest.fn();
        loadingOff = jest.fn();
        renderMask = jest.fn();
        loadingProps = {loadingOff, loadingOn, renderMask, loading: false};
    });

    it("runs text analysis immediately when File has owner Document related to a Vocabulary", () => {
        file.owner = {
            iri: Generator.generateUri(),
            label: "Test document",
            files: [file],
            vocabulary: {
                iri: Generator.generateUri()
            }
        };
        const wrapper = shallow<TextAnalysisInvocationButton>(<TextAnalysisInvocationButton file={file}
                                                                                            executeTextAnalysis={executeTextAnalysis}
                                                                                            notifyAnalysisFinish={notifyAnalysisFinish}
                                                                                            {...loadingProps} {...intlFunctions()}/>);
        wrapper.instance().onClick();
        expect(executeTextAnalysis).toHaveBeenCalledWith(file, undefined);
    });

    it("starts loading when text analysis is invoked", () => {
        file.owner = {
            iri: Generator.generateUri(),
            label: "Test document",
            files: [file],
            vocabulary: {
                iri: Generator.generateUri()
            }
        };
        const wrapper = shallow<TextAnalysisInvocationButton>(<TextAnalysisInvocationButton file={file}
                                                                                            executeTextAnalysis={executeTextAnalysis}
                                                                                            notifyAnalysisFinish={notifyAnalysisFinish}
                                                                                            {...loadingProps} {...intlFunctions()}/>);
        wrapper.instance().onClick();
        expect(loadingOn).toHaveBeenCalled();
    });

    it("stops loading after text analysis invocation finishes", () => {
        file.owner = {
            iri: Generator.generateUri(),
            label: "Test document",
            files: [file],
            vocabulary: {
                iri: Generator.generateUri()
            }
        };
        const wrapper = shallow<TextAnalysisInvocationButton>(<TextAnalysisInvocationButton file={file}
                                                                                            executeTextAnalysis={executeTextAnalysis}
                                                                                            notifyAnalysisFinish={notifyAnalysisFinish}
                                                                                            {...loadingProps} {...intlFunctions()}/>);
        wrapper.instance().onClick();
        return Promise.resolve().then(() => {
            expect(loadingOff).toHaveBeenCalled();
        });
    });

    it("publishes notification after text analysis invocation finishes", () => {
        file.owner = {
            iri: Generator.generateUri(),
            label: "Test document",
            files: [file],
            vocabulary: {
                iri: Generator.generateUri()
            }
        };
        const wrapper = shallow<TextAnalysisInvocationButton>(<TextAnalysisInvocationButton file={file}
                                                                                            executeTextAnalysis={executeTextAnalysis}
                                                                                            notifyAnalysisFinish={notifyAnalysisFinish}
                                                                                            {...loadingProps} {...intlFunctions()}/>);
        wrapper.instance().onClick();
        return Promise.resolve().then(() => {
            expect(notifyAnalysisFinish).toHaveBeenCalled();
        });
    });

    it("shows vocabulary selector when File has no related Vocabulary", () => {
        const wrapper = shallow<TextAnalysisInvocationButton>(<TextAnalysisInvocationButton file={file}
                                                                                            executeTextAnalysis={executeTextAnalysis}
                                                                                            notifyAnalysisFinish={notifyAnalysisFinish}
                                                                                            {...loadingProps} {...intlFunctions()}/>);
        wrapper.instance().onClick();
        wrapper.update();
        expect(wrapper.instance().state.showVocabularySelector).toBeTruthy();
        expect(wrapper.exists(ResourceSelectVocabulary));
        expect(executeTextAnalysis).not.toHaveBeenCalled();
    });

    it("invokes text analysis with selected Vocabulary when Vocabulary selector is submitted", () => {
        const vocabulary = new Vocabulary({
            iri: Generator.generateUri(),
            label: "Test vocabulary"
        });
        const wrapper = shallow<TextAnalysisInvocationButton>(<TextAnalysisInvocationButton file={file}
                                                                                            executeTextAnalysis={executeTextAnalysis}
                                                                                            notifyAnalysisFinish={notifyAnalysisFinish}
                                                                                            {...loadingProps} {...intlFunctions()}/>);
        wrapper.instance().onClick();
        wrapper.update();
        expect(wrapper.instance().state.showVocabularySelector).toBeTruthy();
        wrapper.instance().onVocabularySelect(vocabulary);
        expect(executeTextAnalysis).toHaveBeenLastCalledWith(file, vocabulary.iri);
        wrapper.update();
        expect(wrapper.instance().state.showVocabularySelector).toBeFalsy();
    });
});
