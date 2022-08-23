import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../VocabularyUtils";
import { isEditor, isLoggedIn, isAssetEditable } from "../Authorization";
import { EMPTY_USER } from "../../model/User";

describe("Authorization", () => {
  describe("isLoggedIn", () => {
    it("returns false for empty user", () => {
      expect(isLoggedIn(null)).toBeFalsy();
      expect(isLoggedIn(undefined)).toBeFalsy();
      expect(isLoggedIn(EMPTY_USER)).toBeFalsy();
    });

    it("returns true for non-empty user", () => {
      expect(isLoggedIn(Generator.generateUser())).toBeTruthy();
    });
  });

  describe("isEditor", () => {
    it("returns false when user has restricted user type", () => {
      const user = Generator.generateUser();
      user.types.push(VocabularyUtils.USER_RESTRICTED);
      expect(isEditor(user)).toBeFalsy();
    });

    it("returns true for regular user and admin", () => {
      let user = Generator.generateUser();
      user.types.push(VocabularyUtils.USER_EDITOR);
      expect(isEditor(user)).toBeTruthy();
      user = Generator.generateUser();
      user.types.push(VocabularyUtils.USER_ADMIN);
      expect(isEditor(user)).toBeTruthy();
    });

    it("returns false when user is not logged in at all", () => {
      expect(isEditor(null)).toBeFalsy();
      expect(isEditor(undefined)).toBeFalsy();
    });
  });

  describe("isAssetEditable", () => {
    it("returns true when current user is editor and vocabulary is not read only", () => {
      const user = Generator.generateUser();
      user.types.push(VocabularyUtils.USER_EDITOR);
      expect(
        isAssetEditable(Generator.generateVocabulary(), user)
      ).toBeTruthy();
    });

    it("returns false when current user is editor and vocabulary is read only", () => {
      const user = Generator.generateUser();
      user.types.push(VocabularyUtils.USER_EDITOR);
      const vocabulary = Generator.generateVocabulary();
      vocabulary.types = [VocabularyUtils.IS_READ_ONLY];
      expect(isAssetEditable(vocabulary, user)).toBeFalsy();
    });

    it("returns false when current user is not editor and vocabulary is not read only", () => {
      const user = Generator.generateUser();
      expect(isAssetEditable(Generator.generateVocabulary(), user)).toBeFalsy();
    });
  });
});
