import AccessLevel, { hasAccess } from "../AccessLevel";

describe("AccessLevel", () => {
  describe("hasAccess", () => {
    it.each([
      [AccessLevel.NONE, AccessLevel.NONE, true],
      [AccessLevel.NONE, AccessLevel.READ, true],
      [AccessLevel.NONE, AccessLevel.WRITE, true],
      [AccessLevel.NONE, AccessLevel.SECURITY, true],
      [AccessLevel.READ, AccessLevel.NONE, false],
      [AccessLevel.READ, AccessLevel.READ, true],
      [AccessLevel.READ, AccessLevel.WRITE, true],
      [AccessLevel.READ, AccessLevel.SECURITY, true],
      [AccessLevel.WRITE, AccessLevel.NONE, false],
      [AccessLevel.WRITE, AccessLevel.READ, false],
      [AccessLevel.WRITE, AccessLevel.WRITE, true],
      [AccessLevel.WRITE, AccessLevel.SECURITY, true],
      [AccessLevel.SECURITY, AccessLevel.NONE, false],
      [AccessLevel.SECURITY, AccessLevel.READ, false],
      [AccessLevel.SECURITY, AccessLevel.WRITE, false],
      [AccessLevel.SECURITY, AccessLevel.SECURITY, true],
    ])(
      "return correct result for specified combination of required and actual level",
      (required: AccessLevel, actual: AccessLevel, expectedResult: boolean) => {
        expect(hasAccess(required, actual)).toEqual(expectedResult);
      }
    );
  });
});
