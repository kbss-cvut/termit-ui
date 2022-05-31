import { mountWithIntl } from "../../../__tests__/environment/Environment";
import ImportVocabularyDialog from "../ImportVocabularyDialog";

describe("ImportVocabularyDialog", () => {
  let onCreate: (file: File, rename: Boolean) => any;
  let onCancel: () => void;

  beforeEach(() => {
    onCreate = jest.fn();
    onCancel = jest.fn();
  });

  describe("allowRename", () => {
    it("renders rename checkbox when allowRename is true", () => {
      const wrapper = mountWithIntl(
        <ImportVocabularyDialog
          propKeyPrefix="vocabulary.import"
          onCreate={onCreate}
          onCancel={onCancel}
          allowRename={true}
        />
      );
      expect(
        wrapper.exists("input[name='vocabulary-import-rename']")
      ).toBeTruthy();
    });

    it("does not render rename checkbox when allowRename is false", () => {
      const wrapper = mountWithIntl(
        <ImportVocabularyDialog
          propKeyPrefix="vocabulary.summary.import"
          onCreate={onCreate}
          onCancel={onCancel}
          allowRename={false}
        />
      );
      expect(
        wrapper.exists("input[name='vocabulary-import-rename']")
      ).toBeFalsy();
    });
  });
});
