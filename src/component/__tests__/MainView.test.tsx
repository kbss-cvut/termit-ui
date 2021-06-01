import { MainView } from "../MainView";
import User, { EMPTY_USER } from "../../model/User";
import { intlFunctions } from "../../__tests__/environment/IntlUtil";
import { shallow } from "enzyme";
import { createMemoryHistory } from "history";
import { Breadcrumbs } from "react-breadcrumbs";
import { match, routingProps } from "../../__tests__/environment/TestUtil";

describe("MainView", () => {
  let loadUser: () => void;
  let logout: () => void;

  const nonEmptyUser = new User({
    firstName: "Catherine",
    lastName: "Halsey",
    username: "halsey@unsc.org",
    iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey",
  });

  beforeEach(() => {
    loadUser = jest.fn();
    logout = jest.fn();
  });

  it("loads user on mount", () => {
    shallow(
      <MainView
        user={EMPTY_USER}
        loadUser={loadUser}
        logout={logout}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(loadUser).toHaveBeenCalled();
  });

  it("does not load user when it is already present in store", () => {
    const user = new User({
      firstName: "Catherine",
      lastName: "Halsey",
      username: "halsey@unsc.org",
      iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey",
    });
    shallow(
      <MainView
        user={user}
        loadUser={loadUser}
        logout={logout}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(loadUser).not.toHaveBeenCalled();
  });

  it("renders placeholder UI when user is being loaded", () => {
    const wrapper = shallow(
      <MainView
        user={EMPTY_USER}
        loadUser={loadUser}
        logout={logout}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(wrapper.exists("#loading-placeholder")).toBeTruthy();
  });

  it("does not render breadcrumb on dashboard", () => {
    const wrapper = shallow(
      <MainView
        user={nonEmptyUser}
        loadUser={loadUser}
        logout={logout}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(wrapper.exists(Breadcrumbs)).toBeFalsy();
  });

  it("renders breadcrumb on route different to dashboard", () => {
    const locationVocabularies = {
      pathname: "/vocabularies",
      search: "",
      hash: "",
      state: {},
    };

    const wrapper = shallow(
      <MainView
        user={nonEmptyUser}
        loadUser={loadUser}
        logout={logout}
        history={createMemoryHistory()}
        location={locationVocabularies}
        match={match()}
        {...intlFunctions()}
      />
    );
    expect(wrapper.exists(Breadcrumbs)).toBeTruthy();
  });

  it("renders navbar on >= 768px", () => {
    const wrapper = shallow(
      <MainView
        user={nonEmptyUser}
        loadUser={loadUser}
        logout={logout}
        desktopView={true}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(wrapper.exists("#navbar")).toBeTruthy();
  });

  it("does not render navbar on > 768px", () => {
    const wrapper = shallow(
      <MainView
        user={nonEmptyUser}
        loadUser={loadUser}
        logout={logout}
        desktopView={false}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(wrapper.exists("#navbar")).toBeFalsy();
  });
});
