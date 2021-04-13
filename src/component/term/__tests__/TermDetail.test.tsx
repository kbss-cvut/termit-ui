import * as React from "react";
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
import { IRI } from "../../../util/VocabularyUtils";
import Vocabulary from "../../../model/Vocabulary";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router-dom";
import en from "../../../i18n/en";

jest.mock("../TermAssignments");
jest.mock("../ParentTermSelector");
jest.mock("../../misc/AssetLabel");
jest.mock("../../changetracking/AssetHistory");
jest.mock("../../misc/CopyIriIcon", () => () => <span />);
jest.mock("../DraftToggle", () => () => <span />);

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
  let onPublishNotification: (notification: AppNotification) => void;

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
    onLoad = jest.fn().mockImplementation(() => Promise.resolve());
    loadVocabulary = jest.fn();
    onUpdate = jest.fn().mockImplementation(() => Promise.resolve());
    removeTerm = jest.fn().mockImplementation(() => Promise.resolve());
    onPublishNotification = jest.fn();
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
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        loadVocabulary={loadVocabulary}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        publishNotification={onPublishNotification}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {
      fragment: normalizedVocabName,
    });
  });

  it("provides namespace to term loading when specified in url", () => {
    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
    location.search = "?namespace=" + namespace;
    shallow(
      <TermDetail
        term={null}
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        loadVocabulary={loadVocabulary}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        history={history}
        location={location}
        match={match}
        vocabulary={vocabulary}
        publishNotification={onPublishNotification}
        {...intlFunctions()}
      />
    );
    expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {
      fragment: normalizedVocabName,
      namespace,
    });
  });

  it("renders term metadata by default", () => {
    const wrapper = shallow(
      <TermDetail
        term={term}
        loadTerm={onLoad}
        loadVocabulary={loadVocabulary}
        updateTerm={onUpdate}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        removeTerm={removeTerm}
        vocabulary={vocabulary}
        publishNotification={onPublishNotification}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    expect(wrapper.exists(TermMetadata)).toBeTruthy();
  });

  it("renders term editor after clicking edit button", () => {
    const wrapper = shallow(
      <TermDetail
        term={term}
        loadTerm={onLoad}
        loadVocabulary={loadVocabulary}
        updateTerm={onUpdate}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        removeTerm={removeTerm}
        vocabulary={vocabulary}
        publishNotification={onPublishNotification}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as TermDetail).onEdit();
    expect(wrapper.find(TermMetadataEdit).exists()).toBeTruthy();
  });

  it("invokes termUpdate action on save", () => {
    const wrapper = shallow(
      <TermDetail
        term={term}
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        loadVocabulary={loadVocabulary}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        publishNotification={onPublishNotification}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as TermDetail).onSave(term);
    expect(onUpdate).toHaveBeenCalledWith(term);
  });

  it("closes term metadata edit on save success", () => {
    const wrapper = shallow(
      <TermDetail
        term={term}
        loadTerm={onLoad}
        loadVocabulary={loadVocabulary}
        updateTerm={onUpdate}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        removeTerm={removeTerm}
        publishNotification={onPublishNotification}
        history={history}
        location={location}
        match={match}
        vocabulary={vocabulary}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as TermDetail).onEdit();
    (wrapper.instance() as TermDetail).onSave(term);
    return Promise.resolve().then(() => {
      wrapper.update();
      expect((wrapper.instance() as TermDetail).state.edit).toBeFalsy();
    });
  });

  it("reloads term on successful save", () => {
    const wrapper = shallow(
      <TermDetail
        term={term}
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        loadVocabulary={loadVocabulary}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        publishNotification={onPublishNotification}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as TermDetail).onSave(term);
    return Promise.resolve().then(() => {
      expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {
        fragment: normalizedVocabName,
      });
    });
  });

  it("closes edit when different term is selected", () => {
    const wrapper = shallow(
      <TermDetail
        term={term}
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        loadVocabulary={loadVocabulary}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        publishNotification={onPublishNotification}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as TermDetail).onEdit();
    wrapper.update();
    expect((wrapper.instance() as TermDetail).state.edit).toBeTruthy();
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
    expect((wrapper.instance() as TermDetail).state.edit).toBeFalsy();
  });

  it("does not render edit button when editing", () => {
    const wrapper = shallow(
      <TermDetail
        term={term}
        loadTerm={onLoad}
        loadVocabulary={loadVocabulary}
        updateTerm={onUpdate}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        removeTerm={removeTerm}
        vocabulary={vocabulary}
        publishNotification={onPublishNotification}
        history={history}
        location={location}
        match={match}
        {...intlFunctions()}
      />
    );
    const buttons = (wrapper.instance() as TermDetail).getActions();
    expect(buttons.some((b) => b.key === "term-detail-edit"));
    (wrapper.instance() as TermDetail).onEdit();
    expect(buttons.every((b) => b.key !== "term-detail-edit"));
  });

  it("publishes term update notification when parent term changes", () => {
    const wrapper = shallow<TermDetail>(
      <TermDetail
        term={term}
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        loadVocabulary={loadVocabulary}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        publishNotification={onPublishNotification}
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
    wrapper.instance().onSave(update);
    return Promise.resolve().then(() => {
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
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        loadVocabulary={loadVocabulary}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        publishNotification={onPublishNotification}
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
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        loadVocabulary={loadVocabulary}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        publishNotification={onPublishNotification}
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
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        loadVocabulary={loadVocabulary}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        publishNotification={onPublishNotification}
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
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        loadVocabulary={loadVocabulary}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        publishNotification={onPublishNotification}
        {...intlFunctions()}
      />
    );
    wrapper.setProps({ term });
    wrapper.update();
    expect(wrapper.find(TermMetadata).prop("language")).toEqual(
      Constants.DEFAULT_LANGUAGE
    );
  });

  it("displays edit button as disabled when term is in confirmed state", () => {
    term.draft = false;
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <TermDetail
          term={term}
          configuredLanguage={Constants.DEFAULT_LANGUAGE}
          loadTerm={onLoad}
          updateTerm={onUpdate}
          removeTerm={removeTerm}
          loadVocabulary={loadVocabulary}
          vocabulary={vocabulary}
          history={history}
          location={location}
          match={match}
          publishNotification={onPublishNotification}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    const editButton = wrapper.find("button#term-detail-edit");
    expect(editButton).toBeDefined();
    expect(editButton.prop("disabled")).toBeTruthy();
    expect(editButton.prop("title")).toEqual(
      en.messages["term.edit.confirmed.tooltip"]
    );
  });

  it("loads term and vocabulary when term with the same name but in different vocabulary is selected", () => {
    const wrapper = shallow(
      <TermDetail
        term={term}
        loadTerm={onLoad}
        updateTerm={onUpdate}
        removeTerm={removeTerm}
        configuredLanguage={Constants.DEFAULT_LANGUAGE}
        loadVocabulary={loadVocabulary}
        vocabulary={vocabulary}
        history={history}
        location={location}
        match={match}
        publishNotification={onPublishNotification}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as TermDetail).onEdit();
    wrapper.update();
    expect((wrapper.instance() as TermDetail).state.edit).toBeTruthy();
    const newMatch = {
      params: {
        name: "differentVocabularyName",
        termName: normalizedTermName,
      },
      path: "/differentVocabularyName/terms/" + normalizedTermName,
      isExact: true,
      url: "http://localhost:3000/different",
    };
    wrapper.setProps({ match: newMatch });
    wrapper.update();
    expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {
      fragment: newMatch.params.name,
    });
    expect(loadVocabulary).toHaveBeenCalledWith({
      fragment: newMatch.params.name,
    });
  });
});
