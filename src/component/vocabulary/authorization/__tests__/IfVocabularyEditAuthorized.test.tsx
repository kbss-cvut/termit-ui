import Vocabulary from "../../../../model/Vocabulary";
import Generator from "../../../../__tests__/environment/Generator";
import * as Redux from "react-redux";
import User from "../../../../model/User";
import { mount } from "enzyme";
import IfVocabularyEditAuthorized from "../IfVocabularyEditAuthorized";
import VocabularyUtils from "../../../../util/VocabularyUtils";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("IfVocabularyEditAuthorized", () => {
  let user: User;
  let vocabulary: Vocabulary;

  beforeEach(() => {
    user = Generator.generateUser();
    user.types.push(VocabularyUtils.USER_EDITOR);
    vocabulary = Generator.generateVocabulary();
  });

  it("render children when vocabulary is editable", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mount(
      <IfVocabularyEditAuthorized vocabulary={vocabulary}>
        <TestComponent />
      </IfVocabularyEditAuthorized>
    );
    expect(wrapper.exists(TestComponent)).toBeTruthy();
  });

  it("does not render children when vocabulary is read-only", () => {
    vocabulary.types!.push(VocabularyUtils.IS_READ_ONLY);
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mount(
      <IfVocabularyEditAuthorized vocabulary={vocabulary}>
        <TestComponent />
      </IfVocabularyEditAuthorized>
    );
    expect(wrapper.exists(TestComponent)).toBeFalsy();
  });

  it("does not render children when current user is not editor", () => {
    const notEditor = Generator.generateUser();
    jest.spyOn(Redux, "useSelector").mockReturnValue(notEditor);
    const wrapper = mount(
      <IfVocabularyEditAuthorized vocabulary={vocabulary}>
        <TestComponent />
      </IfVocabularyEditAuthorized>
    );
    expect(wrapper.exists(TestComponent)).toBeFalsy();
  });

  it("does not render children when vocabulary is snapshot", () => {
    vocabulary.types!.push(VocabularyUtils.VOCABULARY_SNAPSHOT);
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mount(
      <IfVocabularyEditAuthorized vocabulary={vocabulary}>
        <TestComponent />
      </IfVocabularyEditAuthorized>
    );
    expect(wrapper.exists(TestComponent)).toBeFalsy();
  });

  const TestComponent = () => <div>Test</div>;
});
