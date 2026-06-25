import Resource from "../../../../model/Resource";
import Ajax from "../../../../util/Ajax";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import CreateFileMetadata from "../CreateFileMetadata";
import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";
import UploadFile from "../UploadFile";
import { act } from "react-dom/test-utils";

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
    Ajax.post = vi
      .fn()
      .mockImplementation(() => Promise.resolve({ data: iri }));
    onCreate = vi.fn().mockImplementation(() => Promise.resolve(iri));
    onCancel = vi.fn();
    file = new Blob([""], { type: "text/html" });
    // @ts-ignore
    file.name = fileName;
  });

  it("uses name of the selected file as label", () => {
    const wrapper = mountWithIntl(
      <CreateFileMetadata
        onCreate={onCreate}
        onCancel={onCancel}
        {...intlFunctions()}
      />
    );
    act(() => {
      wrapper
        .find(UploadFile)
        .props()
        .setFile(file as File);
    });
    const labelInput = wrapper.find('input[name="create-resource-label"]');
    expect((labelInput.getDOMNode() as HTMLInputElement).value).toEqual(
      fileName
    );
  });
});
