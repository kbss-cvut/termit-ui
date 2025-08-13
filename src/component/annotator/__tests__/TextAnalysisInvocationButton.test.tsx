import File from "../../../model/File";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import TextAnalysisInvocationButton from "../TextAnalysisInvocationButton";
import ResourceSelectVocabulary from "../../resource/ResourceSelectVocabulary";
import Vocabulary from "../../../model/Vocabulary";
import * as Redux from "react-redux";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import * as AsyncActions from "../../../action/AsyncActions";
import {
  mountWithIntl,
  webSocketProviderWrappingComponentOptions,
} from "../../../__tests__/environment/Environment";
import { act } from "react-dom/test-utils";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

const mount = (
  el: React.ReactElement<any, string | React.JSXElementConstructor<any>>
) => mountWithIntl(el, webSocketProviderWrappingComponentOptions);

describe("TextAnalysisInvocationButton", () => {
  const namespace = "http://onto.fel.cvut.cz/ontologies/termit/resources/";
  const fileName = "test.html";

  let file: File;
  let vocabulary: Vocabulary;

  beforeEach(() => {
    jest.resetAllMocks();
    file = new File({
      iri: namespace + fileName,
      label: fileName,
      types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
    });
    vocabulary = Generator.generateVocabulary();
    mockUseI18n();
    const fakeDispatch = jest.fn().mockResolvedValue({});
    (Redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
  });

  it("runs text analysis immediately when defaultVocabulary was specified.", () => {
    const vocabularyIri = Generator.generateUri();
    vocabulary.iri = vocabularyIri;
    const fileIri = VocabularyUtils.create(file.iri);

    jest.spyOn(AsyncActions, "executeFileTextAnalysis");

    const wrapper = mount(
      <TextAnalysisInvocationButton
        fileIri={fileIri}
        defaultVocabularyIri={vocabularyIri}
      />
    );
    wrapper.find(ResourceSelectVocabulary).props().onSubmit(vocabulary);
    expect(AsyncActions.executeFileTextAnalysis).toHaveBeenCalledWith(
      fileIri,
      vocabularyIri
    );
  });

  it("shows vocabulary selector when no default vocabulary was specified", () => {
    const fileIri = VocabularyUtils.create(Generator.generateUri());
    jest.spyOn(AsyncActions, "executeFileTextAnalysis");
    const wrapper = mount(<TextAnalysisInvocationButton fileIri={fileIri} />);
    wrapper.simulate("click");
    wrapper.update();
    expect(wrapper.exists(ResourceSelectVocabulary));
    expect(wrapper.find(ResourceSelectVocabulary).props().show).toBeTruthy();
    expect(AsyncActions.executeFileTextAnalysis).not.toHaveBeenCalled();
  });

  it("invokes text analysis with selected Vocabulary when Vocabulary selector is submitted", () => {
    jest.spyOn(AsyncActions, "executeFileTextAnalysis");
    const wrapper = mount(
      <TextAnalysisInvocationButton
        fileIri={VocabularyUtils.create(file.iri)}
      />
    );
    wrapper.simulate("click");
    wrapper.update();

    expect(wrapper.find(ResourceSelectVocabulary).props().show).toBeTruthy();

    act(() => {
      wrapper.find(ResourceSelectVocabulary).props().onSubmit(vocabulary);
    });

    expect(AsyncActions.executeFileTextAnalysis).toHaveBeenLastCalledWith(
      VocabularyUtils.create(file.iri),
      vocabulary.iri
    );
    wrapper.update();
    expect(wrapper.find(ResourceSelectVocabulary).props().show).toBeFalsy();
  });
});
