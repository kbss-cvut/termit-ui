import Comment from "../../../model/Comment";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import CommentEdit from "../CommentEdit";
import Generator from "../../../__tests__/environment/Generator";
import TextArea from "../../misc/TextArea";
import { act } from "react-dom/test-utils";

describe("CommentEdit", () => {
  let onSubmit: (comment: Comment) => void;
  let onCancel: () => void;

  beforeEach(() => {
    onSubmit = jest.fn();
    onCancel = jest.fn();
    mockUseI18n();
  });

  /**
   * Bug #218
   */
  it("passes updated content to onSubmit handler on save click", () => {
    const comment: Comment = new Comment({
      iri: Generator.generateUri(),
      content: "Original content of the comment",
    });
    const newValue = "New content of the comment";
    const wrapper = mountWithIntl(
      <CommentEdit comment={comment} onSubmit={onSubmit} onCancel={onCancel} />
    );
    const textarea = wrapper.find(TextArea);
    act(() =>
      textarea.props().onChange!({
        target: {
          value: newValue,
        },
      } as any)
    );
    wrapper.find("button#comment-edit-submit").simulate("click");
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ content: newValue })
    );
  });
});
