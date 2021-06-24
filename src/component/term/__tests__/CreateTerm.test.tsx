import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Term from "../../../model/Term";
import { shallow } from "enzyme";
import { CreateTerm } from "../CreateTerm";
import Vocabulary, { EMPTY_VOCABULARY } from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import TermMetadataCreate from "../TermMetadataCreate";
import { createMemoryHistory, Location } from "history";
import { match as Match } from "react-router";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";

jest.mock("../../../util/Routing");

describe("CreateTerm", () => {
  const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
  const iri =
    "http://localhost:8080/termit/rest/vocabularies/test-vocabulary/terms/test-term?namespace=" +
    encodeURI(namespace);

  let onCreate: (term: Term, iri: IRI) => Promise<string>;
  let vocabulary: Vocabulary;
  let term: Term;
  let loadVocabulary: (iri: IRI) => void;

  const normalizedVocabName = "test-vocabulary";

  let location: Location;
  const history = createMemoryHistory();
  let match: Match<any>;

  beforeEach(() => {
    onCreate = jest.fn().mockImplementation(() => Promise.resolve(iri));
    loadVocabulary = jest.fn();
    vocabulary = new Vocabulary({
      iri:
        "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/" +
        normalizedVocabName,
      label: "test vocabulary",
    });
    term = new Term({
      iri: Generator.generateUri(),
      label: langString("test term", Constants.DEFAULT_LANGUAGE),
    });
    location = {
      pathname: `/vocabulary/${normalizedVocabName}/term/create`,
      search: "",
      hash: "",
      state: {},
    };
    match = {
      params: {
        name: normalizedVocabName,
      },
      path: location.pathname,
      isExact: true,
      url: "http://localhost:3000/" + location.pathname,
    };
  });

  it("invokes on create on create call", () => {
    const wrapper = shallow(
      <CreateTerm
        createTerm={onCreate}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        loadVocabulary={loadVocabulary}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as CreateTerm).onCreate(term, false);
    expect(onCreate).toHaveBeenCalledWith(
      term,
      VocabularyUtils.create(vocabulary.iri)
    );
  });

  it("invokes transition to term detail on successful creation", () => {
    const wrapper = shallow<CreateTerm>(
      <CreateTerm
        createTerm={onCreate}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        loadVocabulary={loadVocabulary}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as CreateTerm).onCreate(term, false);
    return Promise.resolve().then(() => {
      expect(Routing.transitionTo).toHaveBeenCalled();
      const mock = (Routing.transitionTo as jest.Mock).mock;
      const call = mock.calls[mock.calls.length - 1];
      expect(call[0]).toEqual(Routes.vocabularyTermDetail);
      expect((call[1].params as Map<string, string>).get("name")).toEqual(
        "test-vocabulary"
      );
      expect((call[1].params as Map<string, string>).get("termName")).toEqual(
        "test-term"
      );
      expect((call[1].query as Map<string, string>).get("namespace")).toEqual(
        "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/"
      );
    });
  });

  it("invokes transition to new term on successful creation", () => {
    const wrapper = shallow<CreateTerm>(
      <CreateTerm
        createTerm={onCreate}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        loadVocabulary={loadVocabulary}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as CreateTerm).onCreate(term, true);
    return Promise.resolve().then(() => {
      expect(Routing.transitionTo).toHaveBeenCalled();
      const mock = (Routing.transitionTo as jest.Mock).mock;
      const call = mock.calls[mock.calls.length - 1];
      expect(call[0]).toEqual(Routes.createVocabularyTerm);
      expect((call[1].params as Map<string, string>).get("name")).toEqual(
        "test-vocabulary"
      );
      expect((call[1].query as Map<string, string>).get("namespace")).toEqual(
        "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/"
      );
    });
  });

  it("does not render component while vocabulary is empty", () => {
    const wrapper = shallow<CreateTerm>(
      <CreateTerm
        createTerm={onCreate}
        vocabulary={EMPTY_VOCABULARY}
        history={history}
        location={location}
        match={match}
        loadVocabulary={loadVocabulary}
        {...intlFunctions()}
      />
    );
    expect(wrapper.exists(TermMetadataCreate)).toBeFalsy();
    wrapper.setProps({ vocabulary });
    expect(wrapper.exists(TermMetadataCreate)).toBeTruthy();
  });
});
