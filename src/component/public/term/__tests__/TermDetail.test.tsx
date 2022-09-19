import { IRI } from "../../../../util/VocabularyUtils";
import Vocabulary from "../../../../model/Vocabulary";
import Generator from "../../../../__tests__/environment/Generator";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import { TermDetail } from "../TermDetail";
import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";
import { Location } from "history";
import { match as Match } from "react-router";
import TermMetadata from "../TermMetadata";
import Constants from "../../../../util/Constants";
import * as router from "react-router-dom";

jest.mock("../TermMetadata", () => () => <div>Term metadata</div>);
jest.mock("../../../misc/HeaderWithActions", () => () => <div>Header</div>);
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteMatch: jest.fn(),
  useLocation: jest.fn(),
}));

describe("TermDetail", () => {
  const normalizedTermName = "test-term";
  const normalizedVocabName = "test-vocabulary";

  let loadVocabulary: (iri: IRI) => void;
  let loadTerm: (termName: string, vocabularyIri: IRI) => void;

  let location: Location;
  let match: Match<any>;

  let vocabulary: Vocabulary;

  beforeEach(() => {
    loadVocabulary = jest.fn();
    loadTerm = jest.fn();
    vocabulary = Generator.generateVocabulary();
    location = {
      pathname:
        "/vocabulary/" + normalizedVocabName + "/term/" + normalizedTermName,
      search: "",
      hash: "",
      state: {},
    };
    match = {
      params: {
        name: normalizedVocabName,
        termName: normalizedTermName,
      },
      path: location.pathname,
      isExact: true,
      url: "http://localhost:3000/" + location.pathname,
    };
  });

  it("resolves language when provided term changes", () => {
    const lang = "cs";
    jest.spyOn(router, "useRouteMatch").mockReturnValue(match);
    jest.spyOn(router, "useLocation").mockReturnValue(location);
    const wrapper = mountWithIntl(
      <TermDetail
        configuredLanguage={lang}
        versionSeparator="/version"
        term={null}
        vocabulary={vocabulary}
        loadVocabulary={loadVocabulary}
        loadTerm={loadTerm}
        {...intlFunctions()}
      />
    );
    const term = Generator.generateTerm(vocabulary.iri);
    delete term.label[Constants.DEFAULT_LANGUAGE];
    term.label[lang] = "test label";
    wrapper.setProps({ term });
    wrapper.update();
    const metadata = wrapper.find(TermMetadata);
    expect(metadata.prop("language")).toEqual(lang);
  });
});
