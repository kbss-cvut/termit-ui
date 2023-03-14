import { shallow } from "enzyme";
import UploadFile from "../UploadFile";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import * as Redux from "react-redux";
import Dropzone from "react-dropzone";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

function generateMockFileContent(size: number) {
  let output = "";
  for (let i = 0; i < size; i++) {
    output += "a";
  }
  return output;
}

describe("UploadFile", () => {
  let setFile: (file: File) => void;

  beforeEach(() => {
    setFile = jest.fn();
    mockUseI18n();
  });

  it("passes dropped file to parent", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue({
      maxFileUploadSize: "1KB",
    });
    const wrapper = shallow(<UploadFile setFile={setFile} />);
    const file = new File([generateMockFileContent(100)], "test.html");
    wrapper.find(Dropzone).prop("onDrop")!([file], [], {} as any);
    expect(setFile).toHaveBeenCalledWith(file);
  });

  it("does not provide dropped file to parent when file size exceeds limit", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue({
      maxFileUploadSize: "1KB",
    });
    const wrapper = shallow(<UploadFile setFile={setFile} />);
    const file = new File([generateMockFileContent(1025)], "test.html");
    wrapper.find(Dropzone).prop("onDrop")!([file], [], {} as any);
    expect(setFile).not.toHaveBeenCalled();
  });
});
