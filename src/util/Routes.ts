export class Route {

    public readonly name: string;
    public readonly path: string;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
    }

    public link(params?: object, query?: object): string {
        const path = params
            ? this.path.replace(/:([A-Za-z0-9]+)/g, (match, placeholder) => encodeURIComponent(params[placeholder] || placeholder))
            : this.path;
        if (query) {
            // TODO: Encode URI components properly (and parse them too)
            const queryPart = Object.keys(query).map((key) => (/*encodeURIComponent*/(key) + "=" + /*encodeURIComponent*/(query[key]))).join("&");
            return path + "?" + queryPart;
        } else {
            return path;
        }
    }
}

export default {
    dashboard: new Route("dashboard", "/"),
    administration: new Route("administration", "/administration"),
    createNewUser: new Route("createNewUser", "/administration/users/create"),
    login: new Route("login", "/login"),
    profile: new Route("profile", "/profile"),
    changePassword: new Route("changePassword", "/profile/change-password"),
    register: new Route("register", "/register"),
    search: new Route("search", "/search"),
    searchTerms: new Route("searchTerms", "/search/terms"),
    searchVocabularies: new Route("searchVocabularies", "/search/vocabularies"),
    facetedSearch: new Route("facetedSearch", "/facetedSearch"),
    vocabularies: new Route("vocabulary", "/vocabularies"),
    resources: new Route("resource", "/resources"),
    vocabularyDetail: new Route("vocabularyDetail", "/vocabularies/:name/terms"),
    vocabularySummary: new Route("vocabularySummary", "/vocabularies/:name"),
    annotateVocabularyFile: new Route("annotateVocabularyFile", "/vocabularies/:name/files/:fileName/annotate"),
    annotateFile: new Route("annotateFile", "/resources/:name/annotate"),
    createResource: new Route("createResource", "/resources/create"),
    resourceSummary: new Route("resourceSummary", "/resources/:name"),
    createVocabularyTerm: new Route("createVocabularyTerm", "/vocabularies/:name/terms/create"),
    vocabularyTermDetail: new Route("vocabularyTermDetail", "/vocabularies/:name/terms/:termName"),

    // Public views
    publicDashboard: new Route("publicDashboard", "/public"),
    publicVocabularies: new Route("publicVocabularies", "/public/vocabularies"),
    publicVocabularySummary: new Route("publicVocabularySummary", "/public/vocabularies/:name"),
    publicVocabularyTermDetail: new Route("publicVocabularyTermDetail", "/public/vocabularies/:name/terms/:termName"),
    publicSearch: new Route("publicSearch", "/public/search"),
    publicSearchTerms: new Route("publicSearchTerms", "/public/search/terms"),
    publicSearchVocabularies: new Route("publicSearchVocabularies", "/public/search/vocabularies"),
};
