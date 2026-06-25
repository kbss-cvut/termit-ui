import Generator from "../../../../__tests__/environment/Generator";
import Document from "../../../../model/Document";
import { shallow } from "enzyme";
import DocumentSummary from "../DocumentSummary";
import * as redux from "react-redux";
import { ThunkDispatch } from "../../../../util/Types";
import * as Actions from "../../../../action/AsyncActions";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import DocumentFiles from "../DocumentFiles";
import type { Mock } from "vitest";
import AccessLevel from "../../../../model/acl/AccessLevel";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useDispatch: vi.fn(),
  };
});

describe("DocumentSummaryInTab", () => {
  let document: Document;
  let onChange: () => void;

  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    document = new Document(
      Object.assign(Generator.generateAssetData("Test document"), { files: [] })
    );
    onChange = vi.fn();
    fakeDispatch = vi.fn().mockResolvedValue({});
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
  });

  it("reloads document when file was added to it", () => {
    vi.spyOn(Actions, "loadResource");
    const wrapper = shallow(
      <DocumentSummary
        onChange={onChange}
        document={document}
        accessLevel={AccessLevel.WRITE}
      />
    );
    const files = wrapper.find(DocumentFiles);
    (files.props() as any).onFileAdded();
    expect(Actions.loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(document.iri)
    );
  });

  it("reloads document when file was removed from it", () => {
    vi.spyOn(Actions, "loadResource");
    const wrapper = shallow(
      <DocumentSummary
        onChange={onChange}
        document={document}
        accessLevel={AccessLevel.WRITE}
      />
    );
    const files = wrapper.find(DocumentFiles);
    (files.props() as any).onFileRemoved();
    expect(Actions.loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(document.iri)
    );
  });
});
