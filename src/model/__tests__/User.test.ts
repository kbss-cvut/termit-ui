import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../../util/VocabularyUtils";
import { PasswordUpdateUser, UserDataWithPassword } from "../User";

describe("User", () => {
  describe("isLocked", () => {
    it("returns true when types contain locked user type", () => {
      const sut = Generator.generateUser();
      sut.types.push(VocabularyUtils.USER_LOCKED);
      expect(sut.isLocked()).toBeTruthy();
    });

    it("returns false when types do not contain locked user type", () => {
      const sut = Generator.generateUser();
      expect(sut.isLocked()).toBeFalsy();
    });
  });

  describe("isDisabled", () => {
    it("returns true when types contain disabled user type", () => {
      const sut = Generator.generateUser();
      sut.types.push(VocabularyUtils.USER_DISABLED);
      expect(sut.isDisabled()).toBeTruthy();
    });

    it("returns false when types do not contain disabled user type", () => {
      const sut = Generator.generateUser();
      expect(sut.isDisabled()).toBeFalsy();
    });
  });

  describe("isActive", () => {
    it("returns true when user is neither disabled nor locked", () => {
      const sut = Generator.generateUser();
      expect(sut.isActive()).toBeTruthy();
    });

    it("returns false when user is disabled or locked", () => {
      let sut = Generator.generateUser();
      sut.types.push(VocabularyUtils.USER_DISABLED);
      expect(sut.isActive()).toBeFalsy();
      sut = Generator.generateUser();
      sut.types.push(VocabularyUtils.USER_LOCKED);
      expect(sut.isActive()).toBeFalsy();
    });
  });

  describe("isAdmin", () => {
    it("returns false for regular or restricted user", () => {
      const sut = Generator.generateUser();
      expect(sut.isAdmin()).toBeFalsy();
      sut.types.push(
        "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/omezený-uživatel-termitu"
      );
      expect(sut.isAdmin()).toBeFalsy();
    });

    it("returns true for admin user", () => {
      const sut = Generator.generateUser();
      sut.types.push(VocabularyUtils.USER_ADMIN);
      expect(sut.isAdmin()).toBeTruthy();
    });
  });
});

describe("PasswordUpdateUser", () => {
  describe("constructor", () => {
    it("supports passing password and originalPassword", () => {
      const password = "b";
      const originalPassword = "a";
      const userData: UserDataWithPassword = Object.assign(
        {},
        Generator.generateUser(),
        {
          password,
          originalPassword,
        }
      );
      const sut = new PasswordUpdateUser(userData);
      expect(sut.password).toEqual(password);
      expect(sut.originalPassword).toEqual(originalPassword);
    });
  });
});
