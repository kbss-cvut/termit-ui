import AssetLink from "../AssetLink";
import { MemoryRouter } from "react-router";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import Generator from "../../../__tests__/environment/Generator";
import { fireEvent } from "@testing-library/react";

describe("Asset Link", () => {
  const asset = {
    iri: Generator.generateUri(),
    label: "Test label",
  };

  function renderLink() {
    return renderWithIntl(
      <MemoryRouter>
        <AssetLink asset={asset} path={"/vocabulary"} />
      </MemoryRouter>
    );
  }

  function linkIconSpan(container: HTMLElement): Element | null {
    return container.querySelector(`a[href="${asset.iri}"] > span`);
  }

  it("Render internal link", () => {
    const { container } = renderLink();
    expect(
      container.querySelector('a[href="/vocabulary"]')
    ).toBeInTheDocument();
  });
  it("Render outgoing link", () => {
    const { container } = renderLink();
    expect(
      container.querySelector(`a[href="${asset.iri}"]`)
    ).toBeInTheDocument();
  });
  it("showLink is false by default", () => {
    const { container } = renderLink();
    expect(linkIconSpan(container)).toHaveClass("hidden");
  });
  it("On mouse over sets showLink to true", () => {
    const { container } = renderLink();
    fireEvent.mouseOver(container.querySelector("span.m-asset-link-wrapper")!);
    expect(linkIconSpan(container)).not.toHaveClass("hidden");
  });
  it("On mouse out sets showLink to false", () => {
    const { container } = renderLink();
    const wrapperSpan = container.querySelector("span.m-asset-link-wrapper")!;
    fireEvent.mouseOver(wrapperSpan);
    expect(linkIconSpan(container)).not.toHaveClass("hidden");
    fireEvent.mouseOut(wrapperSpan);
    expect(linkIconSpan(container)).toHaveClass("hidden");
  });
});
