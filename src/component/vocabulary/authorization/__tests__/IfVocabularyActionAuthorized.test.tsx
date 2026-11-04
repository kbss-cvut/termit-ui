import Vocabulary from "../../../../model/Vocabulary";
import Generator from "../../../../__tests__/environment/Generator";
import { render } from "@testing-library/react";
import IfVocabularyActionAuthorized from "../IfVocabularyActionAuthorized";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import AccessLevel from "../../../../model/acl/AccessLevel";

describe("IfVocabularyActionAuthorized", () => {
  let vocabulary: Vocabulary;

  beforeEach(() => {
    vocabulary = Generator.generateVocabulary();
  });

  function renderAuthorized(requiredAccessLevel: AccessLevel) {
    return render(
      <IfVocabularyActionAuthorized
        vocabulary={vocabulary}
        requiredAccessLevel={requiredAccessLevel}
      >
        <TestComponent />
      </IfVocabularyActionAuthorized>
    );
  }

  it("render children when vocabulary access level is sufficient for required access", () => {
    vocabulary.accessLevel = AccessLevel.WRITE;
    const { container } = renderAuthorized(AccessLevel.READ);
    expect(container.querySelector(".test-component")).toBeInTheDocument();
  });

  it("does not render children when vocabulary is read-only", () => {
    vocabulary.types!.push(VocabularyUtils.IS_READ_ONLY);
    vocabulary.accessLevel = AccessLevel.WRITE;
    const { container } = renderAuthorized(AccessLevel.WRITE);
    expect(container.querySelector(".test-component")).not.toBeInTheDocument();
  });

  it("does not render children when vocabulary access level is insufficient for required access", () => {
    vocabulary.accessLevel = AccessLevel.READ;
    const { container } = renderAuthorized(AccessLevel.WRITE);
    expect(container.querySelector(".test-component")).not.toBeInTheDocument();
  });

  it("does not render children when vocabulary is snapshot", () => {
    vocabulary.types!.push(VocabularyUtils.VOCABULARY_SNAPSHOT);
    vocabulary.accessLevel = AccessLevel.WRITE;
    const { container } = renderAuthorized(AccessLevel.READ);
    expect(container.querySelector(".test-component")).not.toBeInTheDocument();
  });

  const TestComponent = () => <div className="test-component">Test</div>;
});
