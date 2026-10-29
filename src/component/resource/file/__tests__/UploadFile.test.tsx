import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadFile from "../UploadFile";
import { i18n } from "../../../../__tests__/environment/IntlUtil";
import * as Redux from "react-redux";
import Generator from "../../../../__tests__/environment/Generator";

vi.mock("react-redux", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-redux")>()),
  useSelector: vi.fn(),
}));

describe("UploadFile", () => {
  let setFile: (file: File) => void;

  beforeEach(() => {
    setFile = vi.fn();
    vi.mocked(Redux.useSelector).mockReturnValue({ maxFileUploadSize: "1KB" });
  });

  it("passes dropped file to parent", async () => {
    const user = userEvent.setup();
    const { container } = renderWithIntl(<UploadFile setFile={setFile} />);
    const file = Generator.generateFile("test.html", 100);
    await user.upload(
      container.querySelector<HTMLInputElement>('input[type="file"]')!,
      file
    );
    expect(setFile).toHaveBeenCalledWith(file);
  });

  it("does not provide dropped file to parent when file size exceeds limit", async () => {
    const user = userEvent.setup();
    const { container } = renderWithIntl(<UploadFile setFile={setFile} />);
    const file = Generator.generateFile("test.html", 1025);
    await user.upload(
      container.querySelector<HTMLInputElement>('input[type="file"]')!,
      file
    );
    expect(
      screen.getByText(i18n("file.upload.size.exceeded"))
    ).toBeInTheDocument();
    expect(setFile).not.toHaveBeenCalled();
  });
});
