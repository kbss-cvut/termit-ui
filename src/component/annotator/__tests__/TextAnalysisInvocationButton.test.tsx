import * as React from "react";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import {shallow} from "enzyme";
import TextAnalysisInvocationButton from "../TextAnalysisInvocationButton";
import {intlFunctions, mockUseI18n} from "../../../__tests__/environment/IntlUtil";
import ResourceSelectVocabulary from "../../resource/ResourceSelectVocabulary";
import Vocabulary from "../../../model/Vocabulary";
import {ThunkDispatch} from "../../../util/Types";
import * as redux from "react-redux";
import * as AsyncActions from "../../../action/AsyncActions";
import * as SyncActions from "../../../action/SyncActions";
import {Button} from "reactstrap";

describe("TextAnalysisInvocationButton", () => {

    let vocabulary: Vocabulary;

    let dispatch: ThunkDispatch;

    beforeEach(() => {
        vocabulary = Generator.generateVocabulary();
        dispatch = jest.fn().mockResolvedValue({});
        jest.spyOn(redux, "useDispatch").mockReturnValue(dispatch);
        jest.spyOn(AsyncActions, "executeFileTextAnalysis");
        jest.spyOn(SyncActions, "publishNotification");
        mockUseI18n();
    });

    it("publishes notification after text analysis invocation finishes", () => {
        const fileIri = VocabularyUtils.create(Generator.generateUri());
        const vocabularyIri = Generator.generateUri();
        vocabulary.iri = vocabularyIri;
        const wrapper = shallow(<TextAnalysisInvocationButton fileIri={fileIri}
                                                              defaultVocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        wrapper.find(ResourceSelectVocabulary).prop("onSubmit")(vocabulary);
        return Promise.resolve().then(() => {
            expect(SyncActions.publishNotification).toHaveBeenCalled();
        });
    });

    it("shows vocabulary selector on button click", () => {
        const fileIri = VocabularyUtils.create(Generator.generateUri());
        const wrapper = shallow(<TextAnalysisInvocationButton fileIri={fileIri} {...intlFunctions()}/>);
        wrapper.find(Button).simulate("click");
        wrapper.update();
        expect(wrapper.exists(ResourceSelectVocabulary));
        expect(wrapper.find(ResourceSelectVocabulary).prop("show")).toBeTruthy();
    });

    it("invokes text analysis with selected Vocabulary when Vocabulary selector is submitted", () => {
        const fileIri = VocabularyUtils.create(Generator.generateUri());
        const vocabularyIri = Generator.generateUri();
        vocabulary.iri = vocabularyIri;
        const wrapper = shallow(<TextAnalysisInvocationButton fileIri={fileIri}
                                                              defaultVocabularyIri={vocabularyIri} {...intlFunctions()}/>);
        wrapper.find(ResourceSelectVocabulary).prop("onSubmit")(vocabulary);
        expect(AsyncActions.executeFileTextAnalysis).toHaveBeenCalledWith(fileIri, vocabularyIri)
    });
});
