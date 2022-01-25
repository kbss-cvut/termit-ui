import TermItState from "../../model/TermItState";
import Generator from "../../__tests__/environment/Generator";
import { getApiPrefix } from "../ActionUtils";
import Constants from "../../util/Constants";

describe("ActionUtils", () => {
  describe("getApiPrefix", () => {
    it("returns regular API prefix when user is logged in", () => {
      const state = new TermItState();
      state.user = Generator.generateUser();
      expect(getApiPrefix(state)).toEqual(Constants.API_PREFIX);
    });

    it("returns public API prefix when user is not logged in", () => {
      const state = new TermItState();
      expect(getApiPrefix(state)).toEqual(Constants.PUBLIC_API_PREFIX);
    });
  });
});
