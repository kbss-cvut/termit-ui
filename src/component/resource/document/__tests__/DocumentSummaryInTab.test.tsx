import Generator from "../../../../__tests__/environment/Generator";
import Document from "../../../../model/Document";
import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import { fireEvent, screen } from "@testing-library/react";
import DocumentSummary from "../DocumentSummary";
import * as redux from "react-redux";
import { ThunkDispatch } from "../../../../util/Types";
import * as Actions from "../../../../action/AsyncActions";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import type { Mock } from "vitest";
import AccessLevel from "../../../../model/acl/AccessLevel";

vi.mock("../DocumentFiles", () => ({
  default: ({
    onFileAdded,
    onFileRemoved,
  }: {
    onFileAdded: () => void;
    onFileRemoved: () => void;
  }) => (
    <>
      <button onClick={onFileAdded}>Add file</button>
      <button onClick={onFileRemoved}>Remove file</button>
    </>
  ),
}));
vi.mock("../../ResourceMetadata", () => ({ default: () => null }));

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
    renderWithIntl(
      <DocumentSummary
        onChange={onChange}
        document={document}
        accessLevel={AccessLevel.WRITE}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Add file" }));
    expect(Actions.loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(document.iri)
    );
  });

  it("reloads document when file was removed from it", () => {
    vi.spyOn(Actions, "loadResource");
    renderWithIntl(
      <DocumentSummary
        onChange={onChange}
        document={document}
        accessLevel={AccessLevel.WRITE}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove file" }));
    expect(Actions.loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(document.iri)
    );
  });
});
