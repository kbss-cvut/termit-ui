import Generator from "../../../__tests__/environment/Generator";
import { render, screen } from "@testing-library/react";
import { AssetLabel } from "../AssetLabel";
import { SKOS } from "../../../util/Namespaces";

describe("AssetLabel", () => {
  let getLabel: (iri: string) => Promise<string>;

  it("loads label using specified IRI on mount", () => {
    const iri = Generator.generateUri();
    const label = "Test";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(label));
    render(<AssetLabel iri={iri} getLabel={getLabel} />);
    expect(getLabel).toHaveBeenCalledWith(iri);
  });

  it("renders loaded label on successful retrieval", async () => {
    const iri = Generator.generateUri();
    const label = "Test";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(label));
    render(<AssetLabel iri={iri} getLabel={getLabel} />);
    expect(await screen.findByText(label)).toBeInTheDocument();
  });

  it("renders IRI passed as props when label cannot be loaded", () => {
    const iri = Generator.generateUri();
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(undefined));
    render(<AssetLabel iri={iri} getLabel={getLabel} />);
    return Promise.resolve().then(() => {
      expect(screen.getByText(iri)).toBeInTheDocument();
    });
  });

  it("renders prefixed IRI if label cannot be loaded", () => {
    const iri = "http://www.w3.org/2004/02/skos/core#narrower";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(undefined));
    render(<AssetLabel iri={iri} getLabel={getLabel} />);
    return Promise.resolve().then(() => {
      expect(screen.getByText(SKOS.prefix + ":narrower")).toBeInTheDocument();
    });
  });

  it("renders shrunk IRI when label cannot be loaded and shrinkFullIri is specified", () => {
    const iri = "http://onto.fel.cvut.cz/ontologies/termit/test-vocabulary";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(undefined));
    render(<AssetLabel iri={iri} getLabel={getLabel} shrinkFullIri={true} />);
    return Promise.resolve().then(() => {
      expect(screen.getByText(".../test-vocabulary")).toBeInTheDocument();
    });
  });

  it("renders shrunk IRI with hash when label cannot be loaded and shrinkFullIri is specified", () => {
    const iri = "http://onto.fel.cvut.cz/ontologies/termit#test-vocabulary";
    getLabel = vi.fn().mockImplementation(() => Promise.resolve(undefined));
    render(<AssetLabel iri={iri} getLabel={getLabel} shrinkFullIri={true} />);
    return Promise.resolve().then(() => {
      expect(screen.getByText("...#test-vocabulary")).toBeInTheDocument();
    });
  });

  it("reloads label when new IRI is passed in props", () => {
    const iriOne = Generator.generateUri();
    const iriTwo = Generator.generateUri();
    getLabel = vi.fn().mockImplementation(() => Promise.resolve("Test"));
    const { rerender } = render(
      <AssetLabel iri={iriOne} getLabel={getLabel} />
    );
    expect(getLabel).toHaveBeenCalledWith(iriOne);
    rerender(<AssetLabel iri={iriTwo} getLabel={getLabel} />);
    expect(getLabel).toHaveBeenCalledTimes(2);
    expect(getLabel).toHaveBeenLastCalledWith(iriTwo);
  });
});
