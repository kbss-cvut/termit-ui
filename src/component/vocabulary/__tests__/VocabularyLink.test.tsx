import { Link, MemoryRouter } from "react-router-dom";
import Vocabulary from "../../../model/Vocabulary";
import VocabularyLink from "../VocabularyLink";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import TermItStore from "../../../store/TermItStore";
import TermItState from "../../../model/TermItState";

describe("Vocabulary Link links to correct internal asset", () => {
  const namespace = "https://test.org/";
  const fragment = "localVocabularyFragment";

  afterEach(() => {
    TermItStore.getState().user = new TermItState().user;
  });

  const vocGen = (namespace: string) =>
    new Vocabulary({
      label: "Test asset",
      iri: namespace + fragment,
    });

  it("links to vocabulary view", () => {
    const vocabulary = vocGen(namespace);
    TermItStore.getState().user = Generator.generateUser();
    const link = mountWithIntl(
      <MemoryRouter>
        <VocabularyLink vocabulary={vocabulary} {...intlFunctions()} />
      </MemoryRouter>
    ).find(Link);
    expect((link.props() as any).to).toEqual(
      "/vocabularies/" + fragment + "?namespace=" + namespace
    );
  });

  it("links to public vocabulary view when current user is empty", () => {
    const vocabulary = vocGen(namespace);
    const link = mountWithIntl(
      <MemoryRouter>
        <VocabularyLink vocabulary={vocabulary} {...intlFunctions()} />
      </MemoryRouter>
    ).find(Link);
    expect((link.props() as any).to).toEqual(
      "/public/vocabularies/" + fragment + "?namespace=" + namespace
    );
  });
});
