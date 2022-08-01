export class Route {
  public readonly name: string;
  public readonly path: string;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
  }

  public link(params?: object, query?: object): string {
    const path = params
      ? this.path.replace(/:([A-Za-z0-9]+)/g, (match, placeholder) =>
          encodeURIComponent(params[placeholder] || placeholder)
        )
      : this.path;
    if (query) {
      // TODO: Encode URI components properly (and parse them too)
      const queryPart = Object.keys(query)
        .map(
          (key) =>
            /*encodeURIComponent*/ key + "=" + /*encodeURIComponent*/ query[key]
        )
        .join("&");
      return path + "?" + queryPart;
    } else {
      return path;
    }
  }
}

const Routes = {
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
  statistics: new Route("statistics", "/statistics"),
  vocabularies: new Route("vocabulary", "/vocabularies"),
  createVocabulary: new Route("createVocabulary", "/vocabularies/create"),
  importVocabulary: new Route("createVocabulary", "/vocabularies/import"),
  vocabularySummary: new Route("vocabularySummary", "/vocabularies/:name"),
  vocabularySnapshotSummary: new Route(
    "vocabularySnapshotSummary",
    "/vocabularies/:name/versions/:timestamp"
  ),
  annotateFile: new Route(
    "annotateFile",
    "/vocabularies/:name/document/:fileName"
  ),
  createVocabularyTerm: new Route(
    "createVocabularyTerm",
    "/vocabularies/:name/terms/create"
  ),
  vocabularyTermDetail: new Route(
    "vocabularyTermDetail",
    "/vocabularies/:name/terms/:termName"
  ),
  vocabularyTermSnapshotDetail: new Route(
    "vocabularyTermSnapshotDetail",
    "/vocabularies/:name/terms/:termName/versions/:timestamp"
  ),

  // Public views
  publicDashboard: new Route("publicDashboard", "/public"),
  publicVocabularies: new Route("publicVocabularies", "/public/vocabularies"),
  publicVocabularySummary: new Route(
    "publicVocabularySummary",
    "/public/vocabularies/:name"
  ),
  publicVocabularySnapshotSummary: new Route(
    "publicVocabularySnapshotSummary",
    "/public/vocabularies/:name/versions/:timestamp"
  ),
  publicVocabularyTermDetail: new Route(
    "publicVocabularyTermDetail",
    "/public/vocabularies/:name/terms/:termName"
  ),
  publicVocabularyTermSnapshotDetail: new Route(
    "publicVocabularyTermSnapshotDetail",
    "/public/vocabularies/:name/terms/:termName/versions/:timestamp"
  ),
  publicSearch: new Route("publicSearch", "/public/search"),
  publicSearchTerms: new Route("publicSearchTerms", "/public/search/terms"),
  publicSearchVocabularies: new Route(
    "publicSearchVocabularies",
    "/public/search/vocabularies"
  ),
};

export default Routes;
