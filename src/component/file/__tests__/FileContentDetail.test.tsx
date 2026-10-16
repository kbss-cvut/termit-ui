import { FileContentDetail } from "../FileContentDetail";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import Term from "../../../model/Term";
import AppNotification from "../../../model/AppNotification";
import { screen } from "@testing-library/react";
import en from "../../../i18n/en";

vi.mock("../../annotator/Annotator", () => ({
  default: (props: { initialHtml: string }) => (
    <div data-testid="annotator">{props.initialHtml}</div>
  ),
}));

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
      consumeNotification: vi.fn(),
      loadFileContent: vi.fn(),
      saveFileContent: vi.fn(),
      clearFileContent: vi.fn(),
      fetchTerms: vi.fn().mockResolvedValue({}),
      loadVocabulary: vi.fn(),
    };
    mockDataProps = {
      defaultTerms: [],
      notifications: [],
    };
  });

  function renderFileContentDetail(
    props: Partial<React.ComponentProps<typeof FileContentDetail>> = {}
  ) {
    return renderWithIntl(
      <FileContentDetail
        iri={fileIri}
        vocabularyIri={vocabularyIri}
        fileContent={fileContent}
        {...mockDataProps}
        {...mockedFunctionLikeProps}
        {...intlFunctions()}
        {...props}
      />
    );
  }

  it("loads file content on mount", () => {
    renderFileContentDetail();
    expect(mockedFunctionLikeProps.loadFileContent).toHaveBeenCalledWith(
      fileIri
    );
  });

  it("loads vocabulary on mount", () => {
    renderFileContentDetail();
    expect(mockedFunctionLikeProps.loadVocabulary).toHaveBeenCalledWith(
      vocabularyIri
    );
  });

  it("renders annotator of file content", () => {
    renderFileContentDetail();
    expect(screen.getByTestId("annotator")).toHaveTextContent(fileContent);
  });

  it("fetches all terms within initialization", () => {
    mockedFunctionLikeProps.fetchTerms = vi.fn(() => Promise.resolve([]));
    renderFileContentDetail();
    expect(mockedFunctionLikeProps.fetchTerms).toHaveBeenCalledWith(
      vocabularyIri
    );
  });

  it("resets file content before unmounting", () => {
    const { unmount } = renderFileContentDetail();
    unmount();
    expect(mockedFunctionLikeProps.clearFileContent).toHaveBeenCalled();
  });

  it("shows loading mask while content is being loaded", () => {
    const { rerender } = renderFileContentDetail({ fileContent: null });
    expect(
      screen.getByText(en.messages["annotator.content.loading"])
    ).toBeInTheDocument();
    rerender(
      <FileContentDetail
        iri={fileIri}
        vocabularyIri={vocabularyIri}
        fileContent={fileContent}
        {...mockDataProps}
        {...mockedFunctionLikeProps}
        {...intlFunctions()}
      />
    );
    expect(
      screen.queryByText(en.messages["annotator.content.loading"])
    ).not.toBeInTheDocument();
  });
});
