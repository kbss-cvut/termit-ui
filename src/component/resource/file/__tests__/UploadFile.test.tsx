import { shallow } from "enzyme";
import UploadFile from "../UploadFile";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import * as Redux from "react-redux";
import Dropzone from "react-dropzone";
import Generator from "../../../../__tests__/environment/Generator";

vi.mock("react-redux", () => ({
  ...vi.importActual("react-redux"),
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

describe("UploadFile", () => {
  let setFile: (file: File) => void;

  beforeEach(() => {
    setFile = vi.fn();
    mockUseI18n();
  });

  it("passes dropped file to parent", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue({
      maxFileUploadSize: "1KB",
    });
    const wrapper = shallow(<UploadFile setFile={setFile} />);
    const file = Generator.generateFile("test.html", 100);
    wrapper.find(Dropzone).prop("onDrop")!([file], [], {} as any);
    expect(setFile).toHaveBeenCalledWith(file);
  });

  it("does not provide dropped file to parent when file size exceeds limit", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue({
      maxFileUploadSize: "1KB",
    });
    const wrapper = shallow(<UploadFile setFile={setFile} />);
    const file = Generator.generateFile("test.html", 1025);
    wrapper.find(Dropzone).prop("onDrop")!([file], [], {} as any);
    expect(setFile).not.toHaveBeenCalled();
  });
});
