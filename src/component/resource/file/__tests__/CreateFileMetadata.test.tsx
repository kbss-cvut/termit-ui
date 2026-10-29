import CreateFileMetadata from "../CreateFileMetadata";
import * as Redux from "react-redux";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import Resource from "../../../../model/Resource";
import Ajax from "../../../../util/Ajax";

vi.mock("react-redux", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-redux")>()),
  useSelector: vi.fn(),
}));

vi.mock("../../../../util/Ajax", () => {
  const originalModule = vi.importActual("../../../../util/Ajax");
  return {
    ...originalModule,
    default: vi.fn(),
  };
});

describe("CreateFileMetadata", () => {
  const fileName = "test.html";
  const iri = "http://onto.fel.cvut.cz/ontologies/termit/resource/" + fileName;

  let file: Blob;

  let onCreate: (data: Resource) => Promise<string>;
  let onCancel: () => void;

  beforeEach(() => {
    vi.mocked(Redux.useSelector).mockImplementation((selector) =>
      selector({
        configuration: { language: "en", maxFileUploadSize: "1MB" },
      } as any)
    );
    Ajax.post = vi
      .fn()
      .mockImplementation(() => Promise.resolve({ data: iri }));
    onCreate = vi.fn().mockImplementation(() => Promise.resolve(iri));
    onCancel = vi.fn();
    file = new Blob([""], { type: "text/html" });
    // @ts-ignore
    file.name = fileName;
  });

  it("uses name of the selected file as label", async () => {
    const user = userEvent.setup();
    const { container } = renderWithIntl(
      <CreateFileMetadata onCreate={onCreate} onCancel={onCancel} />
    );
    await user.upload(
      container.querySelector<HTMLInputElement>('input[type="file"]')!,
      file as File
    );
    expect(screen.getByDisplayValue(fileName)).toHaveValue(fileName);
  });
});
