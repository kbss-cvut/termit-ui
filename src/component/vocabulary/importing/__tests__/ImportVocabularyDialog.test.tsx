import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import ImportVocabularyDialog from "../ImportVocabularyDialog";

describe("ImportVocabularyDialog", () => {
  let onCreate: (file: File, rename: Boolean) => any;
  let onCancel: () => void;

  beforeEach(() => {
    onCreate = vi.fn();
    onCancel = vi.fn();
  });

  describe("allowRename", () => {
    it("renders rename checkbox when allowRename is true", () => {
      const { container } = renderWithIntl(
        <ImportVocabularyDialog
          propKeyPrefix="vocabulary.import"
          onCreate={onCreate}
          onCancel={onCancel}
          allowRename={true}
        />
      );
      expect(
        container.querySelector("input[name='vocabulary-import-rename']")
      ).toBeInTheDocument();
    });

    it("does not render rename checkbox when allowRename is false", () => {
      const { container } = renderWithIntl(
        <ImportVocabularyDialog
          propKeyPrefix="vocabulary.summary.import"
          onCreate={onCreate}
          onCancel={onCancel}
          allowRename={false}
        />
      );
      expect(
        container.querySelector("input[name='vocabulary-import-rename']")
      ).not.toBeInTheDocument();
    });
  });
});
