import { createHashHistory, History, LocationState } from "history";
import Constants from "./Constants";
import Routes, { Route } from "./Routes";
import Asset from "../model/Asset";
import Utils from "./Utils";
import VocabularyUtils from "./VocabularyUtils";
import Term, { TermData, TermInfo } from "../model/Term";
import TermItStore from "../store/TermItStore";
import Vocabulary from "../model/Vocabulary";
import { isLoggedIn } from "./Authorization";
import { isUsingOidcAuth } from "./OidcUtils";
import Document from "../model/Document";
import { TABS } from "../component/vocabulary/VocabularyMetadata";

export class Routing {
  get history(): History {
    return this.mHistory;
  }

  private static setPathParams(path: string, params: Map<string, string>) {
    for (const pair of Array.from(params.entries())) {
      path = path.replace(":" + pair[0], pair[1]);
    }
    return path;
  }

  private static setQueryParams(path: string, params: Map<string, string>) {
    const paramValuePairs = Array.from(params.entries()).map(
      (pair) => pair[0] + "=" + pair[1]
    );
    return paramValuePairs.length > 0
      ? path + "?" + paramValuePairs.join("&")
      : path;
  }

  public static buildUrl(
    route: Route,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
    } = {}
  ) {
    let path = route.path;
    if (options.params) {
      path = Routing.setPathParams(path, options.params);
    }
    if (options.query) {
      path = Routing.setQueryParams(path, options.query);
    }
    return path;
  }

  private readonly mHistory: History;
  private originalTarget?: string;

  constructor() {
    this.mHistory = createHashHistory();
  }

  public saveOriginalTarget = () => {
    this.originalTarget =
      this.mHistory.location.pathname + this.mHistory.location.search;
  };

  public buildFullUrl(
    route: Route | string,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
    } = {}
  ) {
    const innerPath =
      typeof route === "string" ? route : Routing.buildUrl(route, options);
    return window.location.origin + window.location.pathname + "#" + innerPath;
  }

  /**
   * Creates the transition path to the specified route
   * @param route Route object
   * @param options Transition options, can specify path parameters and query parameters.
   */
  public static getTransitionPath = (
    route: Route,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
    } = {}
  ) => {
    return Routing.buildUrl(route, options);
  };

  /**
   * Transitions to the specified route
   * @param route Route object
   * @param options Transition options, can specify path parameters and query parameters.
   */
  public transitionTo = (
    route: Route,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
      state?: LocationState;
    } = {}
  ) => {
    this.mHistory.push(
      Routing.getTransitionPath(route, options),
      options.state
    );
  };

  /**
   * Reloads the current route
   */
  public reload = () => {
    this.mHistory.go(0);
  };

  public transitionToHome = () => {
    this.transitionTo(Constants.HOME_ROUTE);
  };

  public get originalRoutingTarget() {
    return this.originalTarget;
  }

  public transitionToOriginalTarget = () => {
    if (this.originalTarget) {
      this.mHistory.push(this.originalTarget);
      this.originalTarget = undefined;
    } else {
      this.transitionTo(Constants.HOME_ROUTE);
    }
  };

  /**
   * Transitions to the summary view of the specified asset.
   * @param asset Asset to transition to
   * @param options Transition options, can specify path parameters and query parameters.
   */
  public transitionToAsset = (
    asset: Asset,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
    } = {}
  ) => {
    this.makeAssetTransition(asset, options);
  };

  private makeAssetTransition(
    asset: Asset,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
    } = {}
  ) {
    const primaryType = Utils.getPrimaryAssetType(asset);

    switch (primaryType) {
      case VocabularyUtils.VOCABULARY:
        this.transitionToVocabulary(asset as Vocabulary, options);
        break;
      case VocabularyUtils.RESOURCE:
      case VocabularyUtils.DOCUMENT:
      case VocabularyUtils.FILE:
        // Fallback, since there is no resource management screen
        this.transitionToHome();
        break;
      case VocabularyUtils.TERM:
        this.transitionToTerm(asset as Term, options);
        break;
    }
  }

  private transitionToVocabulary(
    asset: Vocabulary,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
    } = {}
  ) {
    const { route, params, query } = Vocabularies.getVocabularyRoutingOptions(
      asset as Vocabulary
    );
    this.transitionTo(route, {
      params: new Map([...params, ...(options.params || new Map())]),
      query: new Map([...query, ...(options.query || new Map())]),
    });
  }

  private transitionToTerm(
    asset: Term | TermData | TermInfo,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
    } = {}
  ) {
    const { route, params, query } = Terms.getTermRoutingOptions(asset as Term);
    this.transitionTo(route, {
      params: new Map([...params, ...(options.params || new Map())]),
      query: new Map([...query, ...(options.query || new Map())]),
    });
  }

  /**
   * Transitions to the public summary view of the specified asset.
   * @param asset Asset to transition to
   * @param options Transition options, can specify path parameters and query parameters
   * @see #transitionToAsset
   */
  public transitionToPublicAsset = (
    asset: Asset,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
    } = {}
  ) => {
    this.makeAssetTransition(asset, options);
  };
}

const INSTANCE = new Routing();

export default INSTANCE;

export function namespaceQueryParam(namespace: string) {
  return new Map<string, string>([
    ["namespace", encodeURIComponent(namespace)],
  ]);
}

export class Terms {
  public static getTermRoutingOptions(term: Term | TermData | TermInfo) {
    const loggedIn = isLoggedIn(TermItStore.getState().user);
    const snapshot = Term.isSnapshot(term);
    const route = loggedIn
      ? snapshot
        ? Routes.vocabularyTermSnapshotDetail
        : Routes.vocabularyTermDetail
      : snapshot
      ? Routes.publicVocabularyTermSnapshotDetail
      : Routes.publicVocabularyTermDetail;
    if (snapshot) {
      const { name, namespace, termName, timestamp } =
        Terms.resolveTermSnapshotTransitionOptions(term);
      return {
        route,
        params: new Map<string, string>([
          ["name", name],
          ["termName", termName],
          ["timestamp", timestamp],
        ]),
        query: namespaceQueryParam(namespace),
      };
    } else {
      const iri = VocabularyUtils.create(term.iri!);
      const vocIri = VocabularyUtils.create(term.vocabulary!.iri!);
      return {
        route,
        params: new Map<string, string>([
          ["name", vocIri.fragment],
          ["termName", iri.fragment],
        ]),
        query: namespaceQueryParam(vocIri.namespace!),
      };
    }
  }

  public static resolveTermSnapshotTransitionOptions(
    term: Term | TermData | TermInfo
  ) {
    const iri = term.iri!;
    const timestamp = iri.substring(iri.lastIndexOf("/") + 1);
    const originalTermIri = VocabularyUtils.create(
      iri.substring(
        0,
        iri.indexOf(TermItStore.getState().configuration.versionSeparator)
      )
    );
    const originalVocabularyIri = VocabularyUtils.create(
      term.vocabulary!.iri!.substring(
        0,
        term.vocabulary!.iri!.indexOf(
          TermItStore.getState().configuration.versionSeparator
        )
      )
    );
    return {
      timestamp,
      termName: originalTermIri.fragment,
      name: originalVocabularyIri.fragment,
      namespace: originalVocabularyIri.namespace!,
    };
  }
}

export class Vocabularies {
  public static getVocabularyRoutingOptions(vocabulary: Vocabulary) {
    const loggedIn = isLoggedIn(TermItStore.getState().user);
    const snapshot = vocabulary.isSnapshot();
    const route = loggedIn
      ? snapshot
        ? Routes.vocabularySnapshotSummary
        : Routes.vocabularySummary
      : snapshot
      ? Routes.publicVocabularySnapshotSummary
      : Routes.publicVocabularySummary;
    if (snapshot) {
      const { name, namespace, timestamp } =
        Vocabularies.resolveVocabularySnapshotTransitionOptions(vocabulary);
      return {
        route,
        params: new Map<string, string>([
          ["name", name],
          ["timestamp", timestamp],
        ]),
        query: namespaceQueryParam(namespace),
      };
    } else {
      const iri = VocabularyUtils.create(vocabulary.iri);
      return {
        route,
        params: new Map<string, string>([["name", iri.fragment]]),
        query: namespaceQueryParam(iri.namespace!),
      };
    }
  }

  public static resolveVocabularySnapshotTransitionOptions(
    vocabulary: Vocabulary
  ) {
    const iri = vocabulary.iri;
    const timestamp = iri.substring(iri.lastIndexOf("/") + 1);
    const originalIri = iri.substring(
      0,
      iri.indexOf(TermItStore.getState().configuration.versionSeparator)
    );
    const vocabularyIri = VocabularyUtils.create(originalIri);
    return {
      name: vocabularyIri.fragment,
      namespace: vocabularyIri.namespace!,
      timestamp,
    };
  }

  /**
   * @param document The document must contain information about the Vocabulary and its iri.
   * @returns route, params and query to respective vocabulary summary and document tab
   */
  public static getDocumentRoutingOptions(document: Document) {
    const loggedIn = isLoggedIn(TermItStore.getState().user);
    const route = loggedIn
      ? Routes.vocabularySummary
      : Routes.publicVocabularySummary;

    const iri = VocabularyUtils.create(document.vocabulary!.iri!);
    return {
      route,
      params: new Map<string, string>([["name", iri.fragment]]),
      query: new Map<string, string>([
        ["namespace", encodeURIComponent(iri.namespace!)],
        ["activeTab", TABS.document],
      ]),
    };
  }
}

/**
 * Route to the login screen from public view.
 *
 * If OIDC authentication is used, the route used is dashboard, which triggers redirect to the remote authentication service.
 * Otherwise, regular TermIt login screen is used.
 */
export const PUBLIC_LOGIN_ROUTE = isUsingOidcAuth()
  ? Routes.dashboard
  : Routes.login;
