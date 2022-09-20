import {
  mockStore,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import { Link, MemoryRouter } from "react-router-dom";
import Generator from "../../../__tests__/environment/Generator";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import VocabularyIriLink from "../VocabularyIriLink";
import TermItState from "../../../model/TermItState";

jest.mock("../../misc/AssetLabel", () => () => <span>Asset</span>);

describe("Vocabulary IRI Link links to correct internal asset", () => {
  const fragment = "localVocabularyFragment";
  const namespace = "http://example.com/";
  const iri = namespace + fragment;

  it("link to an asset", () => {
    mockStore.getState().user = Generator.generateUser();
    const link = mountWithIntl(
      <MemoryRouter>
        <VocabularyIriLink iri={iri} {...intlFunctions()} />
      </MemoryRouter>
    ).find(Link);
    expect((link.props() as any).to).toEqual(
      "/vocabularies/" + fragment + "?namespace=" + namespace
    );
  });

  it("links to public vocabulary view when current user is empty", () => {
    mockStore.getState().user = new TermItState().user;
    const link = mountWithIntl(
      <MemoryRouter>
        <VocabularyIriLink iri={iri} {...intlFunctions()} />
      </MemoryRouter>
    ).find(Link);
    expect((link.props() as any).to).toEqual(
      "/public/vocabularies/" + fragment + "?namespace=" + namespace
    );
  });
});
