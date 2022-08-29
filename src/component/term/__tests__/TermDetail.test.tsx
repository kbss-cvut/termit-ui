import { createMemoryHistory, Location } from "history";
import { match as Match } from "react-router";
import { shallow } from "enzyme";
import { TermDetail } from "../TermDetail";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import TermMetadata from "../TermMetadata";
import TermMetadataEdit from "../TermMetadataEdit";
import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import AppNotification from "../../../model/AppNotification";
import NotificationType from "../../../model/NotificationType";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Vocabulary from "../../../model/Vocabulary";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import TermOccurrence from "../../../model/TermOccurrence";

jest.mock("../ParentTermSelector", () => () => <div>Parent selector</div>);
jest.mock("../RelatedTermsSelector", () => () => (
  <div>Related terms selector</div>
));
jest.mock("../../misc/AssetLabel", () => () => <span>Asset label</span>);
jest.mock("../../changetracking/AssetHistory", () => () => (
  <div>Asset history</div>
));

describe("TermDetail", () => {
  const normalizedTermName = "test-term";
  const normalizedVocabName = "test-vocabulary";

  let location: Location;
  const history = createMemoryHistory();
  let match: Match<any>;

  let onLoad: (termName: string, vocabIri: IRI) => Promise<any>;
  let loadVocabulary: (iri: IRI) => void;
  let onUpdate: (term: Term) => Promise<any>;
  let removeTerm: (term: Term) => Promise<any>;
  let approveOccurrence: (occurrence: TermOccurrence) => Promise<any>;
  let removeOccurrence: (occurrence: TermOccurrence) => Promise<any>;
  let onPublishNotification: (notification: AppNotification) => void;

  let handlers: any;

  let vocabulary: Vocabulary;
  let term: Term;

  beforeEach(() => {
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
    onLoad = jest.fn().mockResolvedValue({});
    loadVocabulary = jest.fn();
    onUpdate = jest.fn().mockResolvedValue({});
    removeTerm = jest.fn().mockResolvedValue({});
    approveOccurrence = jest.fn().mockResolvedValue({});
    removeOccurrence = jest.fn().mockResolvedValue({});
    onPublishNotification = jest.fn();
    handlers = {
      loadTerm: onLoad,
      loadVocabulary,
      updateTerm: onUpdate,
      removeTerm,
      publishNotification: onPublishNotification,
      approveOccurrence,
      removeOccurrence,
    };
    vocabulary = Generator.generateVocabulary();
    term = new Term({
      iri: Generator.generateUri(),
      label: langString("Test term"),
      vocabulary: { iri: Generator.generateUri() },
      draft: true,
    });
  });

  it("loads term on mount", () => {
    shallow(
      <TermDetail
        term={null}
        {...handlers}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    expect(onLoad).toHaveBeenCalledWith(
      normalizedTermName,
      {
        fragment: normalizedVocabName,
      },
      undefined
    );
  });

  it("loads term snapshot on mount with correct IRI", () => {
    const timestamp = "20220731T100000Z";
    match.params.timestamp = timestamp;
    shallow(
      <TermDetail
        term={null}
        {...handlers}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    expect(onLoad).toHaveBeenCalledWith(
      normalizedTermName,
      {
        fragment: normalizedVocabName,
      },
      timestamp
    );
  });

  it("provides namespace to term loading when specified in url", () => {
    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
    location.search = "?namespace=" + namespace;
    shallow(
      <TermDetail
        term={null}
        {...handlers}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        history={history}
        location={location}
        match={match}
        vocabulary={vocabulary}
        {...intlFunctions()}
      />
    );
    expect(onLoad).toHaveBeenCalledWith(
      normalizedTermName,
      {
        fragment: normalizedVocabName,
        namespace,
      },
      undefined
    );
  });

  it("renders term metadata by default", () => {
    const wrapper = shallow(
      <TermDetail
        term={term}
        {...handlers}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    expect(wrapper.exists(TermMetadata)).toBeTruthy();
  });

  it("renders term editor after clicking edit button", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        {...handlers}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onEdit();
    expect(wrapper.find(TermMetadataEdit).exists()).toBeTruthy();
  });

  it("invokes termUpdate action on save", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        {...handlers}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    wrapper
      .instance()
      .onSave(term, { pendingApproval: [], pendingRemoval: [] });
    expect(onUpdate).toHaveBeenCalledWith(term);
  });

  it("closes term metadata edit on save success", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        {...handlers}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        history={history}
        location={location}
        match={match}
        vocabulary={vocabulary}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onEdit();
    return wrapper
      .instance()
      .onSave(term, { pendingApproval: [], pendingRemoval: [] })
      .then(() => {
        wrapper.update();
        expect(wrapper.state().edit).toBeFalsy();
      });
  });

  it("reloads term on successful save", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        {...handlers}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    wrapper
      .instance()
      .onSave(term, { pendingApproval: [], pendingRemoval: [] })
      .then(() => {
        expect(onLoad).toHaveBeenCalledWith(
          normalizedTermName,
          {
            fragment: normalizedVocabName,
          },
          undefined
        );
      });
  });

  it("closes edit when different term is selected", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        {...handlers}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onEdit();
    wrapper.update();
    expect(wrapper.state().edit).toBeTruthy();
    const newMatch = {
      params: {
        name: normalizedVocabName,
        termName: "differentTerm",
      },
      path: "/different",
      isExact: true,
      url: "http://localhost:3000/different",
    };
    wrapper.setProps({ match: newMatch });
    wrapper.update();
    expect(wrapper.state().edit).toBeFalsy();
  });

  it("does not render edit button when editing", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        {...handlers}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    const buttons = wrapper.instance().getActions();
    expect(buttons.some((b) => b.key === "term-detail-edit"));
    wrapper.instance().onEdit();
    expect(buttons.every((b) => b.key !== "term-detail-edit"));
  });

  it("publishes term update notification when parent term changes", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        {...handlers}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    const update = new Term(Object.assign({}, term));
    const newParent = Generator.generateUri();
    update.parentTerms = [
      new Term({
        iri: newParent,
        label: langString("New parent"),
        draft: true,
      }),
    ];
    return wrapper
      .instance()
      .onSave(update, { pendingApproval: [], pendingRemoval: [] })
      .then(() => {
        expect(onPublishNotification).toHaveBeenCalledWith({
          source: { type: NotificationType.TERM_HIERARCHY_UPDATED },
        });
      });
  });

  it("invokes remove action and closes remove confirmation dialog on remove", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        {...handlers}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    wrapper.instance().onRemove();
    expect(removeTerm).toHaveBeenCalledWith(term);
    expect(wrapper.state("showRemoveDialog")).toBeFalsy();
  });

  it("renders term initially in language corresponding to UI", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        configuredLanguage="cs"
        {...handlers}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(TermMetadata).prop("language")).toEqual(
      Constants.DEFAULT_LANGUAGE
    );
  });

  it("renders term in configured language when UI language is not supported", () => {
    const lang = "cs";
    term.label = langString("Pouze česky", lang);
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        configuredLanguage={lang}
        {...handlers}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(TermMetadata).prop("language")).toEqual(lang);
  });

  it("postpones language resolution until term is loaded", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={null}
        configuredLanguage="cs"
        {...handlers}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    wrapper.setProps({ term });
    wrapper.update();
    expect(wrapper.find(TermMetadata).prop("language")).toEqual(
      Constants.DEFAULT_LANGUAGE
    );
  });

  // Bug #1591, situations when term label is the same but it is in a different vocabulary -> different namespace
  it("reloads term and vocabulary when namespace query parameter changes indicating different term", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={null}
        configuredLanguage="cs"
        {...handlers}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    jest.clearAllMocks();
    const newLocation = Object.assign({}, location);
    newLocation.search = `&namespace=${VocabularyUtils.NS_TERMIT}`;
    wrapper.setProps({ location: newLocation });
    wrapper.update();
    expect(onLoad).toHaveBeenCalled();
    expect(loadVocabulary).toHaveBeenCalled();
  });

  it("approves pending definitional occurrences on save", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        configuredLanguage="cs"
        {...handlers}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    const occurrences = [
      Generator.generateOccurrenceOf(term),
      Generator.generateOccurrenceOf(term),
    ];
    wrapper
      .instance()
      .onSave(term, { pendingApproval: occurrences, pendingRemoval: [] });
    return Promise.resolve().then(() => {
      occurrences.forEach((o) =>
        expect(approveOccurrence).toHaveBeenCalledWith(o)
      );
      expect(onUpdate).toHaveBeenCalledWith(term);
    });
  });

  it("removes pending definitional occurrences on save", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        configuredLanguage="cs"
        {...handlers}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    const occurrences = [
      Generator.generateOccurrenceOf(term),
      Generator.generateOccurrenceOf(term),
    ];
    return wrapper
      .instance()
      .onSave(term, { pendingApproval: [], pendingRemoval: occurrences })
      .then(() => {
        occurrences.forEach((o) =>
          expect(removeOccurrence).toHaveBeenCalledWith(o)
        );
        expect(onUpdate).toHaveBeenCalledWith(term);
      });
  });
});
