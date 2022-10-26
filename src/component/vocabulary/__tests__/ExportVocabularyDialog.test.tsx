import * as redux from "react-redux";
import * as AsyncVocabularyActions from "../../../action/AsyncVocabularyActions";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import ExportVocabularyDialog, { Type } from "../ExportVocabularyDialog";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import ExportType from "../../../util/ExportType";

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
    [Type.SKOS, ExportType.CSV],
    [Type.SKOS, ExportType.Excel],
    [Type.SKOS, ExportType.Turtle],
    [Type.SKOS, ExportType.RdfXml],
  ])(
    "exports %p in format %p when selected",
    (type: string, format: ExportType) => {
      const fakeDispatch = jest.fn().mockResolvedValue({});
      (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
      jest.spyOn(AsyncVocabularyActions, "exportGlossary");

      const wrapper = mountWithIntl(
        <ExportVocabularyDialog
          show={true}
          onClose={onClose}
          vocabulary={vocabulary}
        />
      );
      wrapper.find("input").find({ name: type }).simulate("change");
      wrapper.find("input").find({ name: format.mimeType }).simulate("change");
      wrapper.find("button#vocabulary-export-submit").simulate("click");
      expect(AsyncVocabularyActions.exportGlossary).toHaveBeenCalledWith(
        VocabularyUtils.create(vocabulary.iri),
        format
      );
    }
  );

  it.each([
    [Type.SKOS_WITH_REFS, ExportType.Turtle],
    [Type.SKOS_WITH_REFS, ExportType.RdfXml],
  ])(
    "exports %p in format %p when selected",
    (type: string, format: ExportType) => {
      const fakeDispatch = jest.fn().mockResolvedValue({});
      (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
      jest.spyOn(
        AsyncVocabularyActions,
        "exportGlossaryWithExactMatchReferences"
      );

      const wrapper = mountWithIntl(
        <ExportVocabularyDialog
          show={true}
          onClose={onClose}
          vocabulary={vocabulary}
        />
      );
      wrapper.find("input").find({ name: type }).simulate("change");
      wrapper
        .find("input")
        .find({ name: `${format.mimeType}-withRefs` })
        .simulate("change");
      wrapper.find("button#vocabulary-export-submit").simulate("click");
      expect(
        AsyncVocabularyActions.exportGlossaryWithExactMatchReferences
      ).toHaveBeenCalledWith(VocabularyUtils.create(vocabulary.iri), format);
    }
  );

  it.each([
    [Type.SKOS_WITH_REFS, ExportType.CSV],
    [Type.SKOS_WITH_REFS, ExportType.Excel],
  ])(
    "switches to from invalid export type %p to correct export type when format %p is selected",
    (type: string, format: ExportType) => {
      const fakeDispatch = jest.fn().mockResolvedValue({});
      (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
      jest.spyOn(
        AsyncVocabularyActions,
        "exportGlossaryWithExactMatchReferences"
      );
      jest.spyOn(AsyncVocabularyActions, "exportGlossary");

      const wrapper = mountWithIntl(
        <ExportVocabularyDialog
          show={true}
          onClose={onClose}
          vocabulary={vocabulary}
        />
      );
      wrapper.find("input").find({ name: type }).simulate("change");
      wrapper.find("input").find({ name: format.mimeType }).simulate("change");
      wrapper.find("button#vocabulary-export-submit").simulate("click");
      expect(
        AsyncVocabularyActions.exportGlossaryWithExactMatchReferences
      ).not.toHaveBeenCalled();
      expect(AsyncVocabularyActions.exportGlossary).toHaveBeenCalledWith(
        VocabularyUtils.create(vocabulary.iri),
        format
      );
    }
  );

  it("closes dialog after export", () => {
    const fakeDispatch = jest.fn().mockResolvedValue({});
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
    jest.spyOn(AsyncVocabularyActions, "exportGlossary");

    const wrapper = mountWithIntl(
      <ExportVocabularyDialog
        show={true}
        onClose={onClose}
        vocabulary={vocabulary}
      />
    );
    wrapper
      .find("input")
      .find({ name: ExportType.RdfXml.mimeType + "-withRefs" })
      .simulate("change");
    wrapper.find("button#vocabulary-export-submit").simulate("click");
    return Promise.resolve().then(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
