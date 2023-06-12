import Vocabulary from "../../../../model/Vocabulary";
import Generator from "../../../../__tests__/environment/Generator";
import { mount } from "enzyme";
import IfVocabularyActionAuthorized from "../IfVocabularyActionAuthorized";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import AccessLevel from "../../../../model/acl/AccessLevel";

describe("IfVocabularyActionAuthorized", () => {
  let vocabulary: Vocabulary;

  beforeEach(() => {
    vocabulary = Generator.generateVocabulary();
  });

  it("render children when vocabulary access level is sufficient for required access", () => {
    vocabulary.accessLevel = AccessLevel.WRITE;
    const wrapper = mount(
      <IfVocabularyActionAuthorized
        vocabulary={vocabulary}
        requiredAccessLevel={AccessLevel.READ}
      >
        <TestComponent />
      </IfVocabularyActionAuthorized>
    );
    expect(wrapper.exists(TestComponent)).toBeTruthy();
  });

  it("does not render children when vocabulary is read-only", () => {
    vocabulary.types!.push(VocabularyUtils.IS_READ_ONLY);
    vocabulary.accessLevel = AccessLevel.WRITE;
    const wrapper = mount(
      <IfVocabularyActionAuthorized
        vocabulary={vocabulary}
        requiredAccessLevel={AccessLevel.WRITE}
      >
        <TestComponent />
      </IfVocabularyActionAuthorized>
    );
    expect(wrapper.exists(TestComponent)).toBeFalsy();
  });

  it("does not render children when vocabulary access level is insufficient for required access", () => {
    vocabulary.accessLevel = AccessLevel.READ;
    const wrapper = mount(
      <IfVocabularyActionAuthorized
        vocabulary={vocabulary}
        requiredAccessLevel={AccessLevel.WRITE}
      >
        <TestComponent />
      </IfVocabularyActionAuthorized>
    );
    expect(wrapper.exists(TestComponent)).toBeFalsy();
  });

  it("does not render children when vocabulary is snapshot", () => {
    vocabulary.types!.push(VocabularyUtils.VOCABULARY_SNAPSHOT);
    vocabulary.accessLevel = AccessLevel.WRITE;
    const wrapper = mount(
      <IfVocabularyActionAuthorized
        vocabulary={vocabulary}
        requiredAccessLevel={AccessLevel.READ}
      >
        <TestComponent />
      </IfVocabularyActionAuthorized>
    );
    expect(wrapper.exists(TestComponent)).toBeFalsy();
  });

  const TestComponent = () => <div>Test</div>;
});
