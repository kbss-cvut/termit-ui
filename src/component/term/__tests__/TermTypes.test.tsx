import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import OutgoingLink from "../../misc/OutgoingLink";
import TermTypes from "../TermTypes";
import * as Redux from "react-redux";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { OWL, SKOS } from "../../../util/Namespaces";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("TermTypes", () => {
  it("skips implicit term type when rendering types", () => {
    const type = Generator.generateTerm();
    const typesOptions = {};
    typesOptions[type.iri] = type;
    jest.spyOn(Redux, "useSelector").mockReturnValue(typesOptions);
    const types = [VocabularyUtils.TERM, type.iri];
    const wrapper = mountWithIntl(<TermTypes types={types} />);
    const renderedTypes = wrapper.find(OutgoingLink);
    expect(renderedTypes.length).toEqual(1);
    expect(renderedTypes.get(0).props.iri).toEqual(type.iri);
  });

  it("skips OWL and SKOS classes when rendering types", () => {
    const type = Generator.generateTerm();
    const typesOptions = {};
    typesOptions[type.iri] = type;
    jest.spyOn(Redux, "useSelector").mockReturnValue(typesOptions);
    const types = [
      `${SKOS.namespace}Concept`,
      `${OWL.namespace}Thing`,
      type.iri,
    ];
    const wrapper = mountWithIntl(<TermTypes types={types} />);
    const renderedTypes = wrapper.find(OutgoingLink);
    expect(renderedTypes.length).toEqual(1);
    expect(renderedTypes.get(0).props.iri).toEqual(type.iri);
  });
});
