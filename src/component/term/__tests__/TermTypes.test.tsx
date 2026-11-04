import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import TermTypes from "../TermTypes";
import * as Redux from "react-redux";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { OWL, SKOS } from "../../../util/Namespaces";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

vi.mock("../../misc/OutgoingLink", () => ({
  default: (props: { iri: string }) => (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content
    <a className="outgoing-link" data-iri={props.iri} />
  ),
}));

describe("TermTypes", () => {
  it("skips implicit term type when rendering types", () => {
    const type = Generator.generateTerm();
    const typesOptions = {};
    typesOptions[type.iri] = type;
    vi.spyOn(Redux, "useSelector").mockReturnValue(typesOptions);
    const types = [VocabularyUtils.TERM, type.iri];
    const { container } = renderWithIntl(<TermTypes types={types} />);
    const renderedTypes = container.querySelectorAll(".outgoing-link");
    expect(renderedTypes.length).toEqual(1);
    expect(renderedTypes[0].getAttribute("data-iri")).toEqual(type.iri);
  });

  it("skips OWL and SKOS classes when rendering types", () => {
    const type = Generator.generateTerm();
    const typesOptions = {};
    typesOptions[type.iri] = type;
    vi.spyOn(Redux, "useSelector").mockReturnValue(typesOptions);
    const types = [
      `${SKOS.namespace}Concept`,
      `${OWL.namespace}Thing`,
      type.iri,
    ];
    const { container } = renderWithIntl(<TermTypes types={types} />);
    const renderedTypes = container.querySelectorAll(".outgoing-link");
    expect(renderedTypes.length).toEqual(1);
    expect(renderedTypes[0].getAttribute("data-iri")).toEqual(type.iri);
  });
});
