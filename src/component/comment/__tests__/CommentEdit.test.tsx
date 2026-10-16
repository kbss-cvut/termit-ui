import Comment from "../../../model/Comment";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import CommentEdit from "../CommentEdit";
import Generator from "../../../__tests__/environment/Generator";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import en from "../../../i18n/en";

describe("CommentEdit", () => {
  let onSubmit: (comment: Comment) => void;
  let onCancel: () => void;

  beforeEach(() => {
    onSubmit = vi.fn();
    onCancel = vi.fn();
  });

  /**
   * Bug #218
   */
  it("passes updated content to onSubmit handler on save click", async () => {
    const comment: Comment = new Comment({
      iri: Generator.generateUri(),
      content: "Original content of the comment",
    });
    const newValue = "New content of the comment";
    renderWithIntl(
      <CommentEdit comment={comment} onSubmit={onSubmit} onCancel={onCancel} />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: newValue } });
    await userEvent.click(
      screen.getByRole("button", { name: en.messages.save })
    );
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ content: newValue })
    );
  });
});
