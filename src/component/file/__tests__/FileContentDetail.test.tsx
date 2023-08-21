import { FileContentDetail } from "../FileContentDetail";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { shallow } from "enzyme";
import Annotator from "../../annotator/Annotator";
import Term from "../../../model/Term";
import Mask from "../../misc/Mask";
import AppNotification from "../../../model/AppNotification";

describe("FileDetail", () => {
  const fileIri = VocabularyUtils.create("http://file.org/file-iri");
  const vocabularyIri = VocabularyUtils.create(
    "http://vocabulary.org/vocabulary-iri"
  );
  let fileContent: string;
  let mockedFunctionLikeProps: {
    consumeNotification: (notification: AppNotification) => void;
    loadFileContent: (fileIri: IRI) => Promise<any>;
    saveFileContent: (fileIri: IRI, fileContent: string) => Promise<any>;
    clearFileContent: () => void;
    loadVocabulary: (vocabularyIri: IRI) => void;
    fetchTerms: (vocabularyIri: IRI) => Promise<Term[]>;
  };
  let mockDataProps: {
    defaultTerms: Term[];
    notifications: AppNotification[];
  };

  beforeEach(() => {
    fileContent = "<html lang='en'><body>Test content</body></html>";
    mockedFunctionLikeProps = {
      consumeNotification: jest.fn(),
      loadFileContent: jest.fn(),
      saveFileContent: jest.fn(),
      clearFileContent: jest.fn(),
      fetchTerms: jest.fn().mockResolvedValue({}),
      loadVocabulary: jest.fn(),
    };
    mockDataProps = {
      defaultTerms: [],
      notifications: [],
    };
  });

  it("loads file content on mount", () => {
    shallow(
      <FileContentDetail
        iri={fileIri}
        vocabularyIri={vocabularyIri}
        fileContent={fileContent}
        {...mockDataProps}
        {...mockedFunctionLikeProps}
        {...intlFunctions()}
      />
    );

    expect(mockedFunctionLikeProps.loadFileContent).toHaveBeenCalledWith(
      fileIri
    );
  });

  it("loads vocabulary on mount", () => {
    shallow(
      <FileContentDetail
        iri={fileIri}
        vocabularyIri={vocabularyIri}
        fileContent={fileContent}
        {...mockDataProps}
        {...mockedFunctionLikeProps}
        {...intlFunctions()}
      />
    );
    expect(mockedFunctionLikeProps.loadVocabulary).toHaveBeenCalledWith(
      vocabularyIri
    );
  });

  it("renders annotator of file content", () => {
    const wrapper = shallow(
      <FileContentDetail
        iri={fileIri}
        vocabularyIri={vocabularyIri}
        fileContent={fileContent}
        {...mockedFunctionLikeProps}
        {...mockDataProps}
        {...intlFunctions()}
      />
    );

    return Promise.resolve().then(() =>
      expect(wrapper.find(Annotator).exists()).toBeTruthy()
    );
  });

  it("fetches all terms within initialization", () => {
    mockedFunctionLikeProps.fetchTerms = jest.fn(() => Promise.resolve([]));

    shallow(
      <FileContentDetail
        iri={fileIri}
        vocabularyIri={vocabularyIri}
        fileContent={fileContent}
        {...mockDataProps}
        {...mockedFunctionLikeProps}
        {...intlFunctions()}
      />
    );

    expect(mockedFunctionLikeProps.fetchTerms).toBeCalledWith(vocabularyIri);
  });

  it("resets file content before unmounting", () => {
    const wrapper = shallow<FileContentDetail>(
      <FileContentDetail
        iri={fileIri}
        vocabularyIri={vocabularyIri}
        fileContent={fileContent}
        {...mockDataProps}
        {...mockedFunctionLikeProps}
        {...intlFunctions()}
      />
    );
    return Promise.resolve().then(() => {
      wrapper.unmount();
      expect(mockedFunctionLikeProps.clearFileContent).toHaveBeenCalled();
    });
  });

  it("shows loading mask while content is being loaded", () => {
    const wrapper = shallow<FileContentDetail>(
      <FileContentDetail
        iri={fileIri}
        vocabularyIri={vocabularyIri}
        fileContent={null}
        {...mockDataProps}
        {...mockedFunctionLikeProps}
        {...intlFunctions()}
      />
    );
    expect(wrapper.exists(Mask)).toBeTruthy();
    wrapper.setProps({ fileContent });
    wrapper.update();
    return Promise.resolve().then(() =>
      expect(wrapper.exists(Mask)).toBeFalsy()
    );
  });
});
