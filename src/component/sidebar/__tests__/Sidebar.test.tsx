import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { Sidebar } from "../Sidebar";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router";
import User from "../../../model/User";
import { routingProps } from "../../../__tests__/environment/TestUtil";

vi.mock("../../search/label/NavbarSearch", () => ({
  default: () => <input aria-label="Search" />,
}));
vi.mock("../../misc/UserDropdown", () => ({
  default: () => <div>User menu</div>,
}));

describe("Sidebar", () => {
  let toggleSidebar: () => void;

  const user = new User({
    firstName: "Catherine",
    lastName: "Halsey",
    username: "halsey@unsc.org",
    iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey",
  });

  beforeEach(() => {
    toggleSidebar = vi.fn();
  });

  function renderSidebar(sidebarExpanded: boolean, desktopView: boolean) {
    return renderWithIntl(
      <MemoryRouter>
        <Sidebar
          user={user}
          toggleSidebar={toggleSidebar}
          sidebarExpanded={sidebarExpanded}
          desktopView={desktopView}
          {...intlFunctions()}
          {...routingProps()}
        />
      </MemoryRouter>
    );
  }

  it("renders correct structure of component on desktop with sidebar expanded", () => {
    const { container } = renderSidebar(true, true);
    const sidebar = container.querySelector("#sidenav-main")!;
    expect(sidebar).toHaveClass("sidebar-expanded");
    expect(sidebar.querySelectorAll(".brand")).toHaveLength(1);
    const toggler = sidebar.querySelector("#toggler")!;
    expect(
      Array.from(toggler.children).map((child) => child.className)
    ).toEqual(["fas fa-chevron-left fa-xs", "fas fa-bars fa-lg line-height-1"]);
    expect(sidebar.querySelector("#dropdown")).not.toBeInTheDocument();
    expect(sidebar.querySelector("form")).not.toBeInTheDocument();
  });

  it("renders correct structure of component on desktop with sidebar collapsed", () => {
    const { container } = renderSidebar(false, true);
    const sidebar = container.querySelector("#sidenav-main")!;
    expect(sidebar).toHaveClass("sidebar-collapsed");
    expect(sidebar.querySelector(".brand")).not.toBeInTheDocument();
    const toggler = sidebar.querySelector("#toggler")!;
    expect(
      Array.from(toggler.children).map((child) => child.className)
    ).toEqual([
      "fas fa-bars fa-lg line-height-1",
      "fas fa-chevron-right fa-xs",
    ]);
    expect(sidebar.querySelector("#dropdown")).not.toBeInTheDocument();
    expect(sidebar.querySelector(".navbar-heading")).not.toBeInTheDocument();
    expect(sidebar.querySelector("form")).not.toBeInTheDocument();
  });

  it("renders correct structure on mobile", () => {
    const { container } = renderSidebar(false, false);
    const sidebar = container.querySelector("#sidenav-main")!;
    expect(sidebar.querySelectorAll(".brand")).toHaveLength(2);
    expect(sidebar.querySelector("#toggler")).not.toBeInTheDocument();
    expect(sidebar.querySelectorAll(".navbar-toggler")).toHaveLength(2);
    expect(sidebar.querySelector("#dropdown")).toBeInTheDocument();
    expect(sidebar.querySelector(".navbar-heading")).not.toBeInTheDocument();
    expect(sidebar.querySelectorAll("form")).toHaveLength(1);
  });
});
