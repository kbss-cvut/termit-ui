import Generator from "../../../../__tests__/environment/Generator";
import { textContainsFilter } from "../TextBasedFilter";

describe("TextBasedFilter", () => {
  describe("textContainsFilter", () => {
    const filterAtt = "label";

    const makeRow = (value: unknown) =>
      ({
        getValue: (columnId: string) =>
          columnId === filterAtt ? value : undefined,
      } as any);

    it("returns true when filter value is empty", () => {
      const row = makeRow("Random value" + Generator.randomInt());
      expect(textContainsFilter(row, filterAtt, "", () => undefined)).toBe(
        true
      );
    });

    it("returns true when label contains filter value", () => {
      const filterValue = "matching";
      const row = makeRow(filterValue);
      expect(
        textContainsFilter(row, filterAtt, filterValue, () => undefined)
      ).toBe(true);
    });

    it("returns true when label contains filter value as substring", () => {
      const filterValue = "matching";
      const row = makeRow(`Contains ${filterValue}`);
      expect(
        textContainsFilter(row, filterAtt, filterValue, () => undefined)
      ).toBe(true);
    });

    it("returns true when ignoring case", () => {
      const filterValue = "Matching";
      const row = makeRow("MATCHING all caps also works");
      expect(
        textContainsFilter(row, filterAtt, filterValue, () => undefined)
      ).toBe(true);
    });

    it("returns true when ignoring accents", () => {
      const filterValue = "mesto";
      const row = makeRow("Město matches");
      expect(
        textContainsFilter(row, filterAtt, filterValue, () => undefined)
      ).toBe(true);
    });

    it("returns false when label does not contain filter value", () => {
      const filterValue = "matching";
      const row = makeRow("Random value" + Generator.randomInt());
      expect(
        textContainsFilter(row, filterAtt, filterValue, () => undefined)
      ).toBe(false);
    });
  });
});
