import Generator from "../../../../__tests__/environment/Generator";
import { textContainsFilter } from "../TextBasedFilter";

describe("TextBasedFilter", () => {
  describe("textContainsFilter", () => {
    const filterAtt = "label";

    it("returns all rows when filter value is empty", () => {
      const rows = [
        {
          values: { label: "Random value" + Generator.randomInt() },
        },
        {
          values: { label: "Random value" + Generator.randomInt() },
        },
        {
          values: { label: "Random value" + Generator.randomInt() },
        },
      ];
      expect(textContainsFilter(rows, filterAtt, "")).toEqual(rows);
    });

    it("returns rows whose label contains filter value", () => {
      const filterValue = "matching";
      const rows = [
        {
          values: { label: "Random value" + Generator.randomInt() },
        },
        {
          values: { label: filterValue },
        },
        {
          values: { label: filterValue },
        },
      ];
      expect(textContainsFilter(rows, filterAtt, filterValue)).toEqual(
        rows.slice(1)
      );
    });

    it("returns rows whose label contains filter value", () => {
      const filterValue = "matching";
      const rows = [
        {
          values: { label: "Random value" + Generator.randomInt() },
        },
        {
          values: { label: `${filterValue} is substring` },
        },
        {
          values: { label: `Contains ${filterValue}` },
        },
      ];
      expect(textContainsFilter(rows, filterAtt, filterValue)).toEqual(
        rows.slice(1)
      );
    });

    it("returns rows whose label contains filter value when ignoring case", () => {
      const filterValue = "Matching";
      const rows = [
        {
          values: { label: "MATCHING all caps also works" },
        },
        {
          values: { label: "Matching work when ignoring case" },
        },
        {
          values: { label: "Random value" + Generator.randomInt() },
        },
      ];
      expect(textContainsFilter(rows, filterAtt, filterValue)).toEqual(
        rows.slice(0, 2)
      );
    });

    it("returns rows whose label contains filter value when ignoring accents", () => {
      const filterValue = "mesto";
      const rows = [
        {
          values: { label: "Město matches" },
        },
        {
          values: { label: "město matches as well" },
        },
        {
          values: { label: "But místo does not" },
        },
      ];
      expect(textContainsFilter(rows, filterAtt, filterValue)).toEqual(
        rows.slice(0, 2)
      );
    });
  });
});
