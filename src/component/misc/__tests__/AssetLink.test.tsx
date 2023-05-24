import AssetLink from "../AssetLink";
import { EMPTY_VOCABULARY } from "../../../model/Vocabulary";
import { MemoryRouter } from "react-router";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import OutgoingLink from "../OutgoingLink";

describe("Asset Link", () => {
  const voc = EMPTY_VOCABULARY;

  function mount() {
    return mountWithIntl(
      <MemoryRouter>
        <AssetLink asset={voc} path={"/vocabulary"} />
      </MemoryRouter>
    );
  }

  it("Render internal link", () => {
    const wrapper = mount();
    expect(wrapper.find('Link[to="/vocabulary"]').exists()).toBeTruthy();
  });
  it("Render outgoing link", () => {
    const wrapper = mount();
    expect(wrapper.find('a[href="http://empty"]').exists()).toBeTruthy();
  });
  it("showLink is false by default", () => {
    const wrapper = mount();
    expect(wrapper.find(OutgoingLink).prop("showLink")).toBeFalsy();
  });
  it("On mouse over sets showLink to true", () => {
    const wrapper = mount();
    wrapper.find("span.m-asset-link-wrapper").simulate("mouseOver");
    expect(wrapper.find(OutgoingLink).prop("showLink")).toBeTruthy();
  });
  it("On mouse out sets showLink to false", () => {
    const wrapper = mount();
    wrapper.find("span.m-asset-link-wrapper").simulate("mouseOver");
    expect(wrapper.find(OutgoingLink).prop("showLink")).toBeTruthy();
    wrapper.find("span.m-asset-link-wrapper").simulate("mouseOut");
    expect(wrapper.find(OutgoingLink).prop("showLink")).toBeFalsy();
  });
});
