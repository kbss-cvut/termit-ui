import { MemoryRouter } from "react-router-dom";
import Vocabulary from "../../../model/Vocabulary";
import VocabularyLink from "../VocabularyLink";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import TermItStore from "../../../store/TermItStore";
import TermItState from "../../../model/TermItState";
import { langString } from "../../../model/MultilingualString";

describe("Vocabulary Link links to correct internal asset", () => {
  const namespace = "https://test.org/";
  const fragment = "localVocabularyFragment";

  afterEach(() => {
    TermItStore.getState().user = new TermItState().user;
  });

  const vocGen = (namespace: string) =>
    new Vocabulary({
      label: langString("Test asset"),
      iri: namespace + fragment,
    });

  function renderLink(vocabulary: Vocabulary) {
    return renderWithIntl(
      <MemoryRouter>
        <VocabularyLink vocabulary={vocabulary} {...intlFunctions()} />
      </MemoryRouter>
    );
  }

  it("links to vocabulary view", () => {
    const vocabulary = vocGen(namespace);
    TermItStore.getState().user = Generator.generateUser();
    const { container } = renderLink(vocabulary);
    expect(
      container.querySelector('a[href^="/"]')!.getAttribute("href")
    ).toEqual(
      "/vocabularies/" +
        fragment +
        "?namespace=" +
        encodeURIComponent(namespace)
    );
  });

  it("links to public vocabulary view when current user is empty", () => {
    const vocabulary = vocGen(namespace);
    const { container } = renderLink(vocabulary);
    expect(
      container.querySelector('a[href^="/"]')!.getAttribute("href")
    ).toEqual(
      "/public/vocabularies/" +
        fragment +
        "?namespace=" +
        encodeURIComponent(namespace)
    );
  });
});
