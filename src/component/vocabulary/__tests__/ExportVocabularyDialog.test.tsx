import * as redux from "react-redux";
import * as AsyncVocabularyActions from "../../../action/AsyncVocabularyActions";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import ExportVocabularyDialog from "../ExportVocabularyDialog";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import ExportConfig, {
  ExportFormat,
  ExportType,
} from "../../../model/local/ExportConfig";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

describe("ExportVocabularyDialog", () => {
  const vocabulary = Generator.generateVocabulary();

  let onClose: () => void;

  beforeEach(() => {
    onClose = jest.fn();
    jest.clearAllMocks();
  });

  it.each([
    [ExportType.SKOS, ExportFormat.CSV],
    [ExportType.SKOS, ExportFormat.Excel],
    [ExportType.SKOS, ExportFormat.Turtle],
    [ExportType.SKOS, ExportFormat.RdfXml],
  ])(
    "exports %p in format %p when selected",
    (type: ExportType, format: ExportFormat) => {
      const wrapper = mockActionAndRender();
      wrapper.find("input").find({ name: type }).simulate("change");
      wrapper.find("input").find({ name: format.mimeType }).simulate("change");
      wrapper.find("button#vocabulary-export-submit").simulate("click");
      expect(AsyncVocabularyActions.exportGlossary).toHaveBeenCalledWith(
        VocabularyUtils.create(vocabulary.iri),
        new ExportConfig(type, format)
      );
    }
  );

  function mockActionAndRender() {
    const fakeDispatch = jest.fn().mockResolvedValue({});
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
    jest.spyOn(AsyncVocabularyActions, "exportGlossary");

    return mountWithIntl(
      <ExportVocabularyDialog
        show={true}
        onClose={onClose}
        vocabulary={vocabulary}
      />
    );
  }

  it.each([
    [ExportType.SKOS_WITH_REFERENCES, ExportFormat.Turtle],
    [ExportType.SKOS_WITH_REFERENCES, ExportFormat.RdfXml],
  ])(
    "exports %p in format %p when selected",
    (type: ExportType, format: ExportFormat) => {
      const wrapper = mockActionAndRender();
      wrapper.find("input").find({ name: type }).simulate("change");
      wrapper
        .find("input")
        .find({ name: `${format.mimeType}-withRefs` })
        .simulate("change");
      wrapper.find("button#vocabulary-export-submit").simulate("click");
      const expectedConfig = new ExportConfig(type, format);
      expectedConfig.referenceProperties = [VocabularyUtils.SKOS_EXACT_MATCH];
      expect(AsyncVocabularyActions.exportGlossary).toHaveBeenCalledWith(
        VocabularyUtils.create(vocabulary.iri),
        expectedConfig
      );
    }
  );

  it.each([
    [ExportType.SKOS_WITH_REFERENCES, ExportFormat.CSV],
    [ExportType.SKOS_WITH_REFERENCES, ExportFormat.Excel],
  ])(
    "switches to from invalid export type %p to correct export type when format %p is selected",
    (type: ExportType, format: ExportFormat) => {
      const wrapper = mockActionAndRender();
      wrapper.find("input").find({ name: type }).simulate("change");
      wrapper.find("input").find({ name: format.mimeType }).simulate("change");
      wrapper.find("button#vocabulary-export-submit").simulate("click");
      expect(AsyncVocabularyActions.exportGlossary).toHaveBeenCalledWith(
        VocabularyUtils.create(vocabulary.iri),
        new ExportConfig(ExportType.SKOS, format)
      );
    }
  );

  it("closes dialog after export", () => {
    const wrapper = mockActionAndRender();
    wrapper
      .find("input")
      .find({ name: ExportFormat.RdfXml.mimeType + "-withRefs" })
      .simulate("change");
    wrapper.find("button#vocabulary-export-submit").simulate("click");
    return Promise.resolve().then(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
