import { createHashHistory, History } from "history";
import Constants from "./Constants";
import Routes, { Route } from "./Routes";
import Asset from "../model/Asset";
import Utils from "./Utils";
import VocabularyUtils from "./VocabularyUtils";
import Term from "../model/Term";

export class Routing {
    private readonly mHistory: History;
    private originalTarget?: string;

    constructor() {
        this.mHistory = createHashHistory();
    }

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

    public static buildFullUrl(
        route: Route | string,
        options: {
            params?: Map<string, string>;
            query?: Map<string, string>;
        } = {}
    ) {
        const innerPath =
            typeof route === "string"
                ? route
                : Routing.buildUrl(route, options);
        return (
            window.location.origin + window.location.pathname + "#" + innerPath
        );
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
        const iri = VocabularyUtils.create(asset.iri);

        const params = options.params || new Map();
        const query = options.query || new Map();

        switch (primaryType) {
            case VocabularyUtils.VOCABULARY:
                this.transitionTo(
                    isPublic
                        ? Routes.publicVocabularySummary
                        : Routes.vocabularySummary,
                    {
                        params: new Map([["name", iri.fragment], ...params]),
                        query: new Map([
                            ["namespace", iri.namespace!],
                            ...query,
                        ]),
                    }
                );
                break;
            case VocabularyUtils.RESOURCE:
            case VocabularyUtils.DOCUMENT:
            case VocabularyUtils.FILE:
                this.transitionTo(Routes.resourceSummary, {
                    params: new Map([["name", iri.fragment], ...params]),
                    query: new Map([["namespace", iri.namespace!], ...query]),
                });
                break;
            case VocabularyUtils.TERM:
                const vocIri = VocabularyUtils.create(
                    (asset as Term).vocabulary!.iri!
                );
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
                        query: new Map([
                            ["namespace", vocIri.namespace!],
                            ...query,
                        ]),
                    }
                );
                break;
        }
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
