import * as redux from "react-redux";
import * as AsyncVocabularyActions from "../../../action/AsyncVocabularyActions";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import ExportVocabularyDialog from "../ExportVocabularyDialog";
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
  });

  it("exports CSV when CSV option is selected", () => {
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
    wrapper.find("input").find({ name: "csv" }).simulate("change");
    wrapper.find("button#vocabulary-export-submit").simulate("click");
    expect(AsyncVocabularyActions.exportGlossary).toHaveBeenCalledWith(
      VocabularyUtils.create(vocabulary.iri),
      ExportType.CSV
    );
  });

  it("exports Excel when Excel option is selected", () => {
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
    wrapper.find("input").find({ name: "excel" }).simulate("change");
    wrapper.find("button#vocabulary-export-submit").simulate("click");
    expect(AsyncVocabularyActions.exportGlossary).toHaveBeenCalledWith(
      VocabularyUtils.create(vocabulary.iri),
      ExportType.Excel
    );
  });

  it("exports SKOS Turtle when SKOS option is selected", () => {
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
    wrapper.find("input").find({ name: "skos" }).simulate("change");
    wrapper.find("button#vocabulary-export-submit").simulate("click");
    expect(AsyncVocabularyActions.exportGlossary).toHaveBeenCalledWith(
      VocabularyUtils.create(vocabulary.iri),
      ExportType.Turtle
    );
  });

  it("exports SKOS Turtle with exactMatch references when SKOS with references option is selected", () => {
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
    wrapper.find("input").find({ name: "skosWithRefs" }).simulate("change");
    wrapper.find("button#vocabulary-export-submit").simulate("click");
    expect(
      AsyncVocabularyActions.exportGlossaryWithExactMatchReferences
    ).toHaveBeenCalledWith(VocabularyUtils.create(vocabulary.iri));
  });

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
    wrapper.find("button#vocabulary-export-submit").simulate("click");
    return Promise.resolve().then(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
