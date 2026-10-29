import { IRI } from "../../../../util/VocabularyUtils";
import Vocabulary from "../../../../model/Vocabulary";
import Generator from "../../../../__tests__/environment/Generator";
import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import { TermDetail } from "../TermDetail";
import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";
import { Location } from "history";
import Constants from "../../../../util/Constants";
import * as router from "react-router-dom";
import { screen } from "@testing-library/react";

vi.mock("../TermMetadata", () => ({
  default: ({ language }: { language: string }) => (
    <div>Metadata language: {language}</div>
  ),
}));
vi.mock("../../../misc/HeaderWithActions", () => ({
  default: () => <div>Header</div>,
}));
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useParams: vi.fn(),
    useLocation: vi.fn(),
  };
});

describe("TermDetail", () => {
  const normalizedTermName = "test-term";
  const normalizedVocabName = "test-vocabulary";

  let loadVocabulary: (iri: IRI) => void;
  let loadTerm: (termName: string, vocabularyIri: IRI) => Promise<any>;

  let location: Location;
  let params: any;

  let vocabulary: Vocabulary;

  beforeEach(() => {
    loadVocabulary = vi.fn();
    loadTerm = vi.fn();
    vocabulary = Generator.generateVocabulary();
    location = {
      pathname:
        "/vocabulary/" + normalizedVocabName + "/term/" + normalizedTermName,
      search: "",
      hash: "",
      state: {},
    };
    params = {
      name: normalizedVocabName,
      termName: normalizedTermName,
    };
  });

  it("resolves language when provided term changes", () => {
    const lang = "cs";
    vi.spyOn(router, "useParams").mockReturnValue(params);
    vi.spyOn(router, "useLocation").mockReturnValue(location);
    const props = {
      configuredLanguage: lang,
      versionSeparator: "/version",
      vocabulary,
      loadVocabulary,
      loadTerm,
      ...intlFunctions(),
    };
    const { rerender } = renderWithIntl(<TermDetail {...props} term={null} />);
    const term = Generator.generateTerm(vocabulary.iri);
    delete term.label[Constants.DEFAULT_LANGUAGE];
    term.label[lang] = "test label";
    rerender(<TermDetail {...props} term={term} />);
    expect(screen.getByText(`Metadata language: ${lang}`)).toBeInTheDocument();
  });
});
