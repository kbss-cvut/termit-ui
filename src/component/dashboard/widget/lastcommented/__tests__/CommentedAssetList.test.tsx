import { mountWithIntl } from "../../../../../__tests__/environment/Environment";
import en from "../../../../../i18n/en";
import Generator from "../../../../../__tests__/environment/Generator";
import { MemoryRouter } from "react-router-dom";
import User from "../../../../../model/User";
import { intlFunctions } from "../../../../../__tests__/environment/IntlUtil";
import {
  CommentedAssetList,
  DISPLAY_LENGTH_THRESHOLD,
  ELLIPSIS,
} from "../CommentedAssetList";
import Comment from "../../../../../model/Comment";
import VocabularyUtils from "../../../../../util/VocabularyUtils";
import * as Redux from "react-redux";
import TermLink from "../../../../term/TermLink";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("CommentedAssetList", () => {
  let user: User;

  beforeEach(() => {
    user = Generator.generateUser();
  });

  it("does not render info message during loading", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <CommentedAssetList assets={null} {...intlFunctions()} />
      </MemoryRouter>
    );
    const info = wrapper.find(".italics");
    expect(info.exists()).toBeFalsy();
  });

  it("renders info message when no assets were found", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <CommentedAssetList assets={[]} {...intlFunctions()} />
      </MemoryRouter>
    );
    const info = wrapper.find(".italics");
    expect(info.exists()).toBeTruthy();
    expect(info.text()).toEqual(
      en.messages["dashboard.widget.commentList.empty"]
    );
  });

  describe("comment content cutting", () => {
    it("renders substring of the comment text if its length exceeds defined threshold", () => {
      jest.spyOn(Redux, "useSelector").mockReturnValue(user);
      let content = "a";
      while (content.length < DISPLAY_LENGTH_THRESHOLD + 10) {
        content += "a";
      }
      const comment = createComment(content);
      const wrapper = mountWithIntl(
        <MemoryRouter>
          <CommentedAssetList
            assets={[
              {
                lastComment: comment,
                iri: Generator.generateUri(),
                label: "Test",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM],
              },
            ]}
            {...intlFunctions()}
          />
        </MemoryRouter>
      );
      const renderedContent = wrapper.find(".comment-text").text();
      expect(renderedContent.length).toEqual(
        DISPLAY_LENGTH_THRESHOLD + ELLIPSIS.length
      );
    });

    function createComment(content: string) {
      return new Comment({
        iri: Generator.generateUri(),
        created: new Date().toISOString(),
        author: Generator.generateUser(),
        content,
      });
    }

    it("renders substring of the comment text until last possible space if its length exceeds defined threshold", () => {
      jest.spyOn(Redux, "useSelector").mockReturnValue(user);
      let content = "auto";
      while (content.length < DISPLAY_LENGTH_THRESHOLD + 10) {
        content += " auto";
      }
      const comment = createComment(content);
      const wrapper = mountWithIntl(
        <MemoryRouter>
          <CommentedAssetList
            assets={[
              {
                lastComment: comment,
                iri: Generator.generateUri(),
                label: "Test",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM],
              },
            ]}
            {...intlFunctions()}
          />
        </MemoryRouter>
      );
      const renderedContent = wrapper.find(".comment-text").text();
      expect(renderedContent.endsWith("auto" + ELLIPSIS)).toBeTruthy();
    });

    it("does not substring comment content when it fits display length threshold", () => {
      jest.spyOn(Redux, "useSelector").mockReturnValue(user);
      const comment = createComment("test comment 12345");
      const wrapper = mountWithIntl(
        <MemoryRouter>
          <CommentedAssetList
            assets={[
              {
                lastComment: comment,
                iri: Generator.generateUri(),
                label: "Test",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM],
              },
            ]}
            {...intlFunctions()}
          />
        </MemoryRouter>
      );
      const renderedContent = wrapper.find(".comment-text").text();
      expect(renderedContent).toEqual(comment.content);
    });

    it("renders masked label and comment without link to detail when comment view is forbidden", () => {
      jest.spyOn(Redux, "useSelector").mockReturnValue(user);
      const forbiddenComment = createComment("*****");
      const normalComment = createComment("Comment content");
      const wrapper = mountWithIntl(
        <MemoryRouter>
          <CommentedAssetList
            assets={[
              {
                lastComment: forbiddenComment,
                iri: Generator.generateUri(),
                label: "*****",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM, VocabularyUtils.IS_FORBIDDEN],
              },
              {
                lastComment: normalComment,
                iri: Generator.generateUri(),
                label: "Term term",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM],
              },
            ]}
            {...intlFunctions()}
          />
        </MemoryRouter>
      );
      expect(wrapper.find(TermLink).length).toEqual(1);
    });
  });
});
