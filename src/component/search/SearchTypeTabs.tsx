import * as React from "react";
import * as SearchActions from "../../action/SearchActions";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import TermItState from "../../model/TermItState";
import { Nav, NavItem, NavLink } from "reactstrap";
import Routes, { Route } from "../../util/Routes";
import { isLoggedIn } from "../../util/Authorization";
import { useI18n } from "../hook/useI18n";
import Utils from "../../util/Utils";

const SearchTypeTabs: React.FC = () => {
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(SearchActions.addSearchListener());
    return () => dispatch(SearchActions.removeSearchListener()) as any;
  }, [dispatch]);
  const user = useSelector((state: TermItState) => state.user);
  const { i18n } = useI18n();
  const loggedIn = isLoggedIn(user);
  const path = useLocation().pathname;
  const searchString = Utils.extractQueryParams(
    useLocation().search,
    "searchString"
  )[0];

  const tabs: {
    route: Route;
    altExactRoutes: Route[];
    label: string;
    id: string;
  }[] = [
    {
      route: loggedIn ? Routes.search : Routes.publicSearch,
      altExactRoutes: [],
      label: i18n("search.tab.everything"),
      id: "search-tab-everything",
    },
    {
      route: loggedIn ? Routes.searchTerms : Routes.publicSearchTerms,
      altExactRoutes: [],
      label: i18n("search.tab.terms"),
      id: "search-tab-terms",
    },
    {
      route: loggedIn
        ? Routes.searchVocabularies
        : Routes.publicSearchVocabularies,
      altExactRoutes: [],
      label: i18n("search.tab.vocabularies"),
      id: "search-tab-vocabularies",
    },
    {
      route: loggedIn ? Routes.facetedSearch : Routes.publicFacetedSearch,
      altExactRoutes: [],
      label: i18n("search.tab.facets"),
      id: "search-tab-faceted",
    },
  ];

  let activeTab: object | null = null;
  let activeTabDepth = -1;

  // Find active tab using exact matches
  altExactRoutesLoop: for (const tab of tabs) {
    for (const altExactRoute of tab.altExactRoutes) {
      if (path === altExactRoute.path) {
        activeTab = tab;
        break altExactRoutesLoop;
      }
    }
  }

  // Find an active tab
  if (!activeTab) {
    for (const tab of tabs) {
      const isActive =
        path === tab.route.path || path.startsWith(tab.route.path + "/");
      const slashes = tab.route.path.match("/");
      const depth = slashes ? slashes.length : 0;
      if (isActive && depth >= activeTabDepth) {
        activeTab = tab;
        activeTabDepth = depth;
      }
    }
  }

  if (activeTab !== null) {
    return (
      <div>
        <Nav tabs={true} className="justify-content-center">
          {tabs.map((tab) => (
            <NavItem key={tab.route.name}>
              <NavLink
                id={tab.id}
                active={tab === activeTab}
                href={"#" + tab.route.link(undefined, { searchString })}
              >
                {tab.label}
              </NavLink>
            </NavItem>
          ))}
        </Nav>
      </div>
    );
  } else {
    return null;
  }
};

export default SearchTypeTabs;
