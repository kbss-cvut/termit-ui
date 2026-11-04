import Generator from "../../../__tests__/environment/Generator";
import { act, render, screen } from "@testing-library/react";
import { AssetLabel } from "../AssetLabel";
import { SKOS } from "../../../util/Namespaces";

describe("AssetLabel", () => {
  let getLabel: (iri: string) => Promise<string>;

  it("loads label using specified IRI on mount", async () => {
    const iri = Generator.generateUri();
    const label = "Test";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(label));
    await act(async () => {
      render(<AssetLabel iri={iri} getLabel={getLabel} />);
    });
    expect(getLabel).toHaveBeenCalledWith(iri);
  });

  it("renders loaded label on successful retrieval", async () => {
    const iri = Generator.generateUri();
    const label = "Test";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(label));
    render(<AssetLabel iri={iri} getLabel={getLabel} />);
    expect(await screen.findByText(label)).toBeInTheDocument();
  });

  it("renders IRI passed as props when label cannot be loaded", async () => {
    const iri = Generator.generateUri();
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(undefined));
    await act(async () => {
      render(<AssetLabel iri={iri} getLabel={getLabel} />);
    });
    expect(screen.getByText(iri)).toBeInTheDocument();
  });

  it("renders prefixed IRI if label cannot be loaded", async () => {
    const iri = "http://www.w3.org/2004/02/skos/core#narrower";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(undefined));
    await act(async () => {
      render(<AssetLabel iri={iri} getLabel={getLabel} />);
    });
    expect(screen.getByText(SKOS.prefix + ":narrower")).toBeInTheDocument();
  });

  it("renders shrunk IRI when label cannot be loaded and shrinkFullIri is specified", async () => {
    const iri = "http://onto.fel.cvut.cz/ontologies/termit/test-vocabulary";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(undefined));
    await act(async () => {
      render(<AssetLabel iri={iri} getLabel={getLabel} shrinkFullIri={true} />);
    });
    expect(screen.getByText(".../test-vocabulary")).toBeInTheDocument();
  });

  it("renders shrunk IRI with hash when label cannot be loaded and shrinkFullIri is specified", async () => {
    const iri = "http://onto.fel.cvut.cz/ontologies/termit#test-vocabulary";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(undefined));
    await act(async () => {
      render(<AssetLabel iri={iri} getLabel={getLabel} shrinkFullIri={true} />);
    });
    expect(screen.getByText("...#test-vocabulary")).toBeInTheDocument();
  });

  it("reloads label when new IRI is passed in props", async () => {
    const iriOne = Generator.generateUri();
    const iriTwo = Generator.generateUri();
    getLabel = vi.fn().mockImplementation(() => Promise.resolve("Test"));
    const { rerender } = await act(async () =>
      render(<AssetLabel iri={iriOne} getLabel={getLabel} />)
    );
    expect(getLabel).toHaveBeenCalledWith(iriOne);
    await act(async () => {
      rerender(<AssetLabel iri={iriTwo} getLabel={getLabel} />);
    });
    expect(getLabel).toHaveBeenCalledTimes(2);
    expect(getLabel).toHaveBeenLastCalledWith(iriTwo);
  });
});
