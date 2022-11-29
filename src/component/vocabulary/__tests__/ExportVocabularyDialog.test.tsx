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
    [ExportType.SKOS_FULL, ExportFormat.Turtle],
    [ExportType.SKOS_FULL, ExportFormat.RdfXml],
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
    [ExportType.SKOS_FULL_WITH_REFERENCES, ExportFormat.Turtle],
    [ExportType.SKOS_FULL_WITH_REFERENCES, ExportFormat.RdfXml],
  ])(
    "exports %p in format %p when selected",
    (type: ExportType, format: ExportFormat) => {
      const wrapper = mockActionAndRender();
      wrapper.find("input").find({ name: type }).simulate("change");
      wrapper.find("input").find({ name: format.mimeType }).simulate("change");
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
    [ExportType.SKOS_FULL, ExportFormat.CSV],
    [ExportType.SKOS_FULL, ExportFormat.Excel],
    [ExportType.SKOS_WITH_REFERENCES, ExportFormat.CSV],
    [ExportType.SKOS_WITH_REFERENCES, ExportFormat.Excel],
    [ExportType.SKOS_FULL_WITH_REFERENCES, ExportFormat.CSV],
    [ExportType.SKOS_FULL_WITH_REFERENCES, ExportFormat.Excel],
  ])(
    "switches to from invalid export type %p to correct export type when format %p is selected",
    (type: ExportType, format: ExportFormat) => {
      const wrapper = mockActionAndRender();
      wrapper.find("input").find({ name: format.mimeType }).simulate("change");
      wrapper.find("input").find({ name: type }).simulate("change");
      wrapper.find("button#vocabulary-export-submit").simulate("click");
      expect(AsyncVocabularyActions.exportGlossary).toHaveBeenCalled();
      const exportConf = (AsyncVocabularyActions.exportGlossary as jest.Mock)
        .mock.calls[0][1];
      expect((exportConf as ExportConfig).format).toEqual(ExportFormat.Turtle);
      expect((exportConf as ExportConfig).type).toEqual(type);
    }
  );

  it("closes dialog after export", () => {
    const wrapper = mockActionAndRender();
    wrapper
      .find("input")
      .find({ name: ExportFormat.RdfXml.mimeType })
      .simulate("change");
    wrapper.find("button#vocabulary-export-submit").simulate("click");
    return Promise.resolve().then(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
