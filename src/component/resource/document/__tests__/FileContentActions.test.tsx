import TermItFile from "../../../../model/File";
import Generator from "../../../../__tests__/environment/Generator";
import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import { act, screen } from "@testing-library/react";
import FileContentActions from "../FileContentActions";
import { i18n } from "../../../../__tests__/environment/IntlUtil";
import Constants from "../../../../util/Constants";
import * as Redux from "react-redux";

vi.mock("react-redux", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-redux")>()),
  useDispatch: vi.fn(),
}));

describe("FileContentActions", () => {
  let file: TermItFile;
  let onDownload: (file: TermItFile) => void;
  let onDownloadOriginal: (file: TermItFile) => void;

  beforeEach(() => {
    file = new TermItFile({
      iri: Generator.generateUri(),
      label: "test.html",
    });
    onDownload = vi.fn();
    onDownloadOriginal = vi.fn();
    vi.mocked(Redux.useDispatch).mockReturnValue(
      vi.fn().mockResolvedValue(null)
    );
  });

  it("does not display actions dropdown when file has no content", async () => {
    const { container } = renderWithIntl(
      <FileContentActions
        file={file}
        onDownload={onDownload}
        onDownloadOriginal={onDownloadOriginal}
      />
    );
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it("displays actions dropdown for file with content type", async () => {
    vi.mocked(Redux.useDispatch).mockReturnValue(
      vi.fn().mockResolvedValue(Constants.HTML_MIME_TYPE)
    );
    renderWithIntl(
      <FileContentActions
        file={file}
        onDownload={onDownload}
        onDownloadOriginal={onDownloadOriginal}
      />
    );
    expect(
      await screen.findByRole("button", {
        name: i18n("resource.metadata.file.content"),
      })
    ).toBeInTheDocument();
  });
});
