import TermItFile from "../../../../model/File";
import Generator from "../../../../__tests__/environment/Generator";
import * as Redux from "react-redux";
import FileContentActions from "../FileContentActions";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import Constants from "../../../../util/Constants";
import { UncontrolledButtonDropdown } from "reactstrap";
import {
  flushPromises,
  mountWithIntl,
} from "../../../../__tests__/environment/Environment";
import { act } from "react-dom/test-utils";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

describe("FileContentActions", () => {
  let file: TermItFile;
  let onDownload: (file: TermItFile) => void;
  let onDownloadOriginal: (file: TermItFile) => void;

  beforeEach(() => {
    mockUseI18n();
    file = new TermItFile({
      iri: Generator.generateUri(),
      label: "test.html",
    });
    onDownload = jest.fn();
    onDownloadOriginal = jest.fn();
  });

  it("does not display actions dropdown when file has no content", async () => {
    jest
      .spyOn(Redux, "useDispatch")
      .mockReturnValue(jest.fn().mockResolvedValue(null));
    const wrapper = mountWithIntl(
      <FileContentActions
        file={file}
        onDownload={onDownload}
        onDownloadOriginal={onDownloadOriginal}
      />
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.isEmptyRender()).toBeTruthy();
  });

  it("displays actions dropdown for file with content type", async () => {
    jest
      .spyOn(Redux, "useDispatch")
      .mockReturnValue(jest.fn().mockResolvedValue(Constants.HTML_MIME_TYPE));
    const wrapper = mountWithIntl(
      <FileContentActions
        file={file}
        onDownload={onDownload}
        onDownloadOriginal={onDownloadOriginal}
      />
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.exists(UncontrolledButtonDropdown)).toBeTruthy();
  });
});
