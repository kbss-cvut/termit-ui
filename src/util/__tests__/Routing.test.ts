import RoutingInstance, { Routing } from "../Routing";
import Routes from "../Routes";
import { createHashHistory } from "history";
import VocabularyUtils from "../VocabularyUtils";
import Vocabulary from "../../model/Vocabulary";
import Generator from "../../__tests__/environment/Generator";
import { langString } from "../../model/MultilingualString";
import Constants from "../Constants";

jest.mock("history", () => ({
  createHashHistory: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

describe("Routing", () => {
  const historyMock = createHashHistory();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("get transition path", () => {
    it("replaces path variables with values", () => {
      const name = "test-vocabulary";
      const path = Routing.getTransitionPath(Routes.vocabularySummary, {
        params: new Map([["name", name]]),
      });
      const expectedPath = Routes.vocabularySummary.path.replace(":name", name);
      expect(path).toEqual(expectedPath);
    });
    it("adds query parameters when specified for transition", () => {
      const name = "test-vocabulary";
      const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabulary/";
      const path = Routing.getTransitionPath(Routes.vocabularies, {
        query: new Map([["namespace", namespace]]),
      });
      const expectedPath =
        Routes.vocabularies.path.replace(":name", name) +
        "?namespace=" +
        namespace;
      expect(path).toEqual(expectedPath);
    });
  });

  describe("transition to", () => {
    it("transitions to route without any parameter", () => {
      RoutingInstance.transitionTo(Routes.vocabularies);
      expect(historyMock.push).toHaveBeenCalledWith(Routes.vocabularies.path);
    });
  });

  describe("transitionToAsset", () => {
    const label = "test-asset";
    const namespace = VocabularyUtils.NS_TERMIT;
    const iri = namespace + label;

    it("transitions to vocabulary summary for a vocabulary", () => {
      const vocabulary = new Vocabulary({ iri, label });
      RoutingInstance.transitionToAsset(vocabulary);
      expect(historyMock.push).toHaveBeenCalledWith(
        Routing.getTransitionPath(Routes.vocabularySummary, {
          params: new Map([["name", label]]),
          query: new Map([["namespace", namespace]]),
        })
      );
    });

    it("transitions to term detail for a term", () => {
      const term = Generator.generateTerm(iri);
      term.label = langString("test-term");
      term.iri = iri + "/pojem/" + term.label[Constants.DEFAULT_LANGUAGE];
      RoutingInstance.transitionToAsset(term);
      expect(historyMock.push).toHaveBeenCalledWith(
        Routing.getTransitionPath(Routes.vocabularyTermDetail, {
          params: new Map([
            ["name", label],
            ["termName", term.label[Constants.DEFAULT_LANGUAGE]],
          ]),
          query: new Map([["namespace", namespace]]),
        })
      );
    });
  });

  describe("transitionToPublicAsset", () => {
    const label = "test-asset";
    const namespace = VocabularyUtils.NS_TERMIT;
    const iri = namespace + label;

    it("transitions to public vocabulary summary for a vocabulary", () => {
      const vocabulary = new Vocabulary({ iri, label });
      RoutingInstance.transitionToPublicAsset(vocabulary);
      expect(historyMock.push).toHaveBeenCalledWith(
        Routing.getTransitionPath(Routes.publicVocabularySummary, {
          params: new Map([["name", label]]),
          query: new Map([["namespace", namespace]]),
        })
      );
    });

    it("transitions to public term detail for a term", () => {
      const term = Generator.generateTerm(iri);
      term.label = langString("test-term");
      term.iri = iri + "/pojem/" + term.label[Constants.DEFAULT_LANGUAGE];
      RoutingInstance.transitionToPublicAsset(term);
      expect(historyMock.push).toHaveBeenCalledWith(
        Routing.getTransitionPath(Routes.publicVocabularyTermDetail, {
          params: new Map([
            ["name", label],
            ["termName", term.label[Constants.DEFAULT_LANGUAGE]],
          ]),
          query: new Map([["namespace", namespace]]),
        })
      );
    });
  });

  describe("saveOriginalTarget", () => {
    afterEach(() => {
      // @ts-ignore
      delete RoutingInstance.history.location;
      // @ts-ignore
      RoutingInstance.originalTarget = undefined;
    });

    it("stores current URL for later transition", () => {
      const originalPath = Routes.administration.path;
      RoutingInstance.history.location = {
        hash: originalPath,
        pathname: originalPath,
        state: null,
        search: "",
      };
      RoutingInstance.saveOriginalTarget();
      expect(RoutingInstance.originalRoutingTarget).toEqual(
        Routes.administration.path
      );
    });
  });

  describe("transitionToOriginalTarget", () => {
    afterEach(() => {
      // @ts-ignore
      delete RoutingInstance.history.location;
      // @ts-ignore
      RoutingInstance.originalTarget = undefined;
    });

    it("transitions to dashboard when no original target is available", () => {
      RoutingInstance.transitionToOriginalTarget();
      expect(historyMock.push).toHaveBeenCalledWith(
        Routing.getTransitionPath(Routes.dashboard)
      );
    });

    it("transitions to original saved target when there is one", () => {
      const originalPath = Routes.administration.path;
      RoutingInstance.history.location = {
        hash: originalPath,
        pathname: originalPath,
        state: null,
        search: "",
      };
      RoutingInstance.saveOriginalTarget();
      RoutingInstance.transitionToOriginalTarget();
      expect(historyMock.push).toHaveBeenCalledWith(
        Routing.getTransitionPath(Routes.administration)
      );
    });
  });
});
