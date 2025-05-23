import File from "../../../model/File";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
import { TextAnalysisInvocationButton } from "../TextAnalysisInvocationButton";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import ResourceSelectVocabulary from "../../resource/ResourceSelectVocabulary";
import Vocabulary from "../../../model/Vocabulary";
import { webSocketProviderWrappingComponentOptions } from "../../../__tests__/environment/Environment";

describe("TextAnalysisInvocationButton", () => {
  const namespace = "http://onto.fel.cvut.cz/ontologies/termit/resources/";
  const fileName = "test.html";

  let file: File;

  let executeTextAnalysis: (
    fileIri: IRI,
    vocabularyIri?: string
  ) => Promise<any>;
  let notifyAnalysisFinish: () => void;
  let vocabulary: Vocabulary;

  beforeEach(() => {
    file = new File({
      iri: namespace + fileName,
      label: fileName,
      types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
    });
    executeTextAnalysis = jest.fn().mockImplementation(() => Promise.resolve());
    notifyAnalysisFinish = jest.fn();
    vocabulary = Generator.generateVocabulary();
  });

  it("runs text analysis immediately when defaultVocabulary was specified.", () => {
    const vocabularyIri = Generator.generateUri();
    vocabulary.iri = vocabularyIri;
    const fileIri = VocabularyUtils.create(file.iri);
    const wrapper = shallow<TextAnalysisInvocationButton>(
      <TextAnalysisInvocationButton
        fileIri={fileIri}
        executeTextAnalysis={executeTextAnalysis}
        notifyAnalysisFinish={notifyAnalysisFinish}
        defaultVocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onVocabularySelect(vocabulary);
    expect(executeTextAnalysis).toHaveBeenCalledWith(fileIri, vocabularyIri);
  });

  it("shows vocabulary selector when no default vocabulary was specified", () => {
    const fileIri = VocabularyUtils.create(Generator.generateUri());
    const wrapper = shallow<TextAnalysisInvocationButton>(
      <TextAnalysisInvocationButton
        fileIri={fileIri}
        executeTextAnalysis={executeTextAnalysis}
        notifyAnalysisFinish={notifyAnalysisFinish}
        {...intlFunctions()}
      />,
      webSocketProviderWrappingComponentOptions
    );
    wrapper.instance().onClick();
    wrapper.update();
    expect(wrapper.instance().state.showVocabularySelector).toBeTruthy();
    expect(wrapper.exists(ResourceSelectVocabulary));
    expect(executeTextAnalysis).not.toHaveBeenCalled();
  });

  it("invokes text analysis with selected Vocabulary when Vocabulary selector is submitted", () => {
    const wrapper = shallow<TextAnalysisInvocationButton>(
      <TextAnalysisInvocationButton
        fileIri={VocabularyUtils.create(file.iri)}
        executeTextAnalysis={executeTextAnalysis}
        notifyAnalysisFinish={notifyAnalysisFinish}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onClick();
    wrapper.update();
    expect(wrapper.instance().state.showVocabularySelector).toBeTruthy();
    wrapper.instance().onVocabularySelect(vocabulary);
    expect(executeTextAnalysis).toHaveBeenLastCalledWith(
      VocabularyUtils.create(file.iri),
      vocabulary.iri
    );
    wrapper.update();
    expect(wrapper.instance().state.showVocabularySelector).toBeFalsy();
  });
});
