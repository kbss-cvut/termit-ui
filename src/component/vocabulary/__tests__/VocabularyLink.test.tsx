import { Link, MemoryRouter } from "react-router-dom";
import Vocabulary from "../../../model/Vocabulary";
import { VocabularyLink } from "../VocabularyLink";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import Generator from "../../../__tests__/environment/Generator";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { EMPTY_USER } from "../../../model/User";

describe("Vocabulary Link links to correct internal asset", () => {
  const fragment = "localVocabularyFragment";

  const vocGen = (namespace: string) =>
    new Vocabulary({
      label: "Test asset",
      iri: namespace + fragment,
    });

  it("link to an asset", () => {
    const namespace = "http://test.org/";
    const vocabulary = vocGen(namespace);
    const link = mountWithIntl(
      <MemoryRouter>
        <VocabularyLink
          vocabulary={vocabulary}
          user={Generator.generateUser()}
          {...intlFunctions()}
        />
      </MemoryRouter>
    ).find(Link);
    expect((link.props() as any).to).toEqual(
      "/vocabularies/" + fragment + "?namespace=" + namespace
    );
  });

  it("links to public vocabulary view when current user is empty", () => {
    const namespace = "http://test.org/";
    const vocabulary = vocGen(namespace);
    const link = mountWithIntl(
      <MemoryRouter>
        <VocabularyLink
          vocabulary={vocabulary}
          user={EMPTY_USER}
          {...intlFunctions()}
        />
      </MemoryRouter>
    ).find(Link);
    expect((link.props() as any).to).toEqual(
      "/public/vocabularies/" + fragment + "?namespace=" + namespace
    );
  });
});
