import {
  mockStore,
  renderWithIntl,
} from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router-dom";
import Generator from "../../../__tests__/environment/Generator";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import VocabularyIriLink from "../VocabularyIriLink";
import TermItState from "../../../model/TermItState";

vi.mock("../../misc/AssetLabel", () => ({ default: () => <span>Asset</span> }));

describe("Vocabulary IRI Link links to correct internal asset", () => {
  const fragment = "localVocabularyFragment";
  const namespace = "http://example.com/";
  const iri = namespace + fragment;

  function renderLink() {
    return renderWithIntl(
      <MemoryRouter>
        <VocabularyIriLink iri={iri} {...intlFunctions()} />
      </MemoryRouter>
    );
  }

  it("link to an asset", () => {
    mockStore.getState().user = Generator.generateUser();
    const { container } = renderLink();
    expect(
      container.querySelector('a[href^="/"]')!.getAttribute("href")
    ).toEqual("/vocabularies/" + fragment + "?namespace=" + namespace);
  });

  it("links to public vocabulary view when current user is empty", () => {
    mockStore.getState().user = new TermItState().user;
    const { container } = renderLink();
    expect(
      container.querySelector('a[href^="/"]')!.getAttribute("href")
    ).toEqual("/public/vocabularies/" + fragment + "?namespace=" + namespace);
  });
});
