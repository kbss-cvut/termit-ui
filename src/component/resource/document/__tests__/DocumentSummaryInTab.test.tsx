import Generator from "../../../../__tests__/environment/Generator";
import Document from "../../../../model/Document";
import { shallow } from "enzyme";
import DocumentSummary from "../DocumentSummary";
import * as redux from "react-redux";
import { ThunkDispatch } from "../../../../util/Types";
import * as Actions from "../../../../action/AsyncActions";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import DocumentFiles from "../DocumentFiles";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

describe("DocumentSummaryInTab", () => {
  let document: Document;
  let onChange: () => void;

  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    document = new Document(
      Object.assign(Generator.generateAssetData("Test document"), { files: [] })
    );
    onChange = jest.fn();
    fakeDispatch = jest.fn().mockResolvedValue({});
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
  });

  it("reloads document when file was added to it", () => {
    jest.spyOn(Actions, "loadResource");
    const wrapper = shallow(
      <DocumentSummary onChange={onChange} document={document} />
    );
    const files = wrapper.find(DocumentFiles);
    (files.props() as any).onFileAdded();
    expect(Actions.loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(document.iri)
    );
  });

  it("reloads document when file was removed from it", () => {
    jest.spyOn(Actions, "loadResource");
    const wrapper = shallow(
      <DocumentSummary onChange={onChange} document={document} />
    );
    const files = wrapper.find(DocumentFiles);
    (files.props() as any).onFileRemoved();
    expect(Actions.loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(document.iri)
    );
  });
});
