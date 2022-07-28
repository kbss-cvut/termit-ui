import { createHashHistory, History } from "history";
import Constants from "./Constants";
import Routes, { Route } from "./Routes";
import Asset from "../model/Asset";
import Utils from "./Utils";
import VocabularyUtils from "./VocabularyUtils";
import Term from "../model/Term";
import TermItStore from "../store/TermItStore";
import Vocabulary from "../model/Vocabulary";

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
    } = {}
  ) => {
    this.mHistory.push(Routing.getTransitionPath(route, options));
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
    this.makeAssetTransition(false, asset, options);
  };

  private makeAssetTransition(
    isPublic: boolean,
    asset: Asset,
    options: {
      params?: Map<string, string>;
      query?: Map<string, string>;
    } = {}
  ) {
    const primaryType = Utils.getPrimaryAssetType(asset);

    const params = options.params || new Map();
    const query = options.query || new Map();

    switch (primaryType) {
      case VocabularyUtils.VOCABULARY:
        this.transitionToVocabulary(
          isPublic,
          asset as Vocabulary,
          params,
          query
        );
        break;
      case VocabularyUtils.RESOURCE:
      case VocabularyUtils.DOCUMENT:
      case VocabularyUtils.FILE:
        // Fallback, since there is no resource management screen
        this.transitionToHome();
        break;
      case VocabularyUtils.TERM:
        this.transitionToTerm(isPublic, asset as Term, params, query);
        break;
    }
  }

  private transitionToVocabulary(
    isPublic: boolean,
    vocabulary: Vocabulary,
    params: Map<string, string>,
    query: Map<string, string>
  ) {
    if (!vocabulary.isSnapshot()) {
      const iri = VocabularyUtils.create(vocabulary.iri);
      this.transitionTo(
        isPublic ? Routes.publicVocabularySummary : Routes.vocabularySummary,
        {
          params: new Map([["name", iri.fragment], ...params]),
          query: new Map([["namespace", iri.namespace!], ...query]),
        }
      );
    } else {
      const { name, namespace, timestamp } =
        Routing.resolveVocabularySnapshotTransitionOptions(vocabulary);
      this.transitionTo(
        isPublic
          ? Routes.publicVocabularySnapshotSummary
          : Routes.vocabularySnapshotSummary,
        {
          params: new Map([
            ["name", name],
            ["timestamp", timestamp],
            ...params,
          ]),
          query: new Map([["namespace", namespace], ...query]),
        }
      );
    }
  }

  public static resolveVocabularySnapshotTransitionOptions(
    vocabulary: Vocabulary
  ) {
    const timestamp = vocabulary.iri.substring(
      vocabulary.iri.lastIndexOf("/") + 1
    );
    const originalIri = vocabulary.iri.substring(
      0,
      vocabulary.iri.indexOf(
        TermItStore.getState().configuration.versionSeparator
      )
    );
    const iri = VocabularyUtils.create(originalIri);
    return {
      name: iri.fragment,
      namespace: iri.namespace!,
      timestamp,
    };
  }

  private transitionToTerm(
    isPublic: boolean,
    term: Term,
    params: Map<string, string>,
    query: Map<string, string>
  ) {
    if (!term.isSnapshot()) {
      const iri = VocabularyUtils.create(term.iri);
      const vocIri = VocabularyUtils.create(term.vocabulary!.iri!);
      this.transitionTo(
        isPublic
          ? Routes.publicVocabularyTermDetail
          : Routes.vocabularyTermDetail,
        {
          params: new Map([
            ["name", vocIri.fragment],
            ["termName", iri.fragment],
            ...params,
          ]),
          query: new Map([["namespace", vocIri.namespace!], ...query]),
        }
      );
    } else {
      const { name, namespace, termName, timestamp } =
        Routing.resolveTermSnapshotTransitionOptions(term);
      this.transitionTo(
        isPublic
          ? Routes.publicVocabularyTermSnapshotDetail
          : Routes.vocabularyTermSnapshotDetail,
        {
          params: new Map([
            ["name", name],
            ["termName", termName],
            ["timestamp", timestamp],
            ...params,
          ]),
          query: new Map([["namespace", namespace], ...query]),
        }
      );
    }
  }

  public static resolveTermSnapshotTransitionOptions(term: Term) {
    const timestamp = term.iri.substring(term.iri.lastIndexOf("/") + 1);
    const originalTermIri = VocabularyUtils.create(
      term.iri.substring(
        0,
        term.iri.indexOf(TermItStore.getState().configuration.versionSeparator)
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
    this.makeAssetTransition(true, asset, options);
  };
}

const INSTANCE = new Routing();

export default INSTANCE;
