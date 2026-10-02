import { Pagination as BootstrapPagination } from "reactstrap";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import { Pagination, PaginationApi, getPaginationRange } from "../Pagination";
import Constants from "../../../../util/Constants";
import BrowserStorage from "../../../../util/BrowserStorage";
import type { Mock } from "vitest";

vi.mock("../../../../util/BrowserStorage");

describe("Pagination", () => {
  let table: PaginationApi;

  beforeEach(() => {
    table = {
      getState: () => ({ pagination: { pageSize: 10, pageIndex: 0 } }),
      getCanNextPage: vi.fn(() => true),
      getCanPreviousPage: vi.fn(() => false),
      setPageIndex: vi.fn(),
      nextPage: vi.fn(),
      getPageCount: vi.fn(() => 1),
      previousPage: vi.fn(),
      setPageSize: vi.fn(),
    };
  });

  it("stores selected page size in local storage", () => {
    const wrapper = mountWithIntl(
      <Pagination table={table} allowSizeChange={true} />
    );
    const sizeSelect = wrapper.find("select");
    const value = 20;
    sizeSelect.simulate("change", { target: { value } });
    expect(table.setPageSize).toHaveBeenCalledWith(value);
    expect(BrowserStorage.set).toHaveBeenCalledWith(
      Constants.STORAGE_TABLE_PAGE_SIZE_KEY,
      value
    );
  });

  it("loads stored page size on mount", () => {
    const size = 20;
    (BrowserStorage.get as Mock).mockReturnValue(size.toString());
    mountWithIntl(<Pagination table={table} allowSizeChange={true} />);
    expect(table.setPageSize).toHaveBeenCalledWith(size);
  });

  it("does not render pagination when page size is greater than item count", () => {
    const size = 20;
    (table.getCanPreviousPage as Mock).mockReturnValue(false);
    (table.getCanNextPage as Mock).mockReturnValue(false);
    (BrowserStorage.get as Mock).mockReturnValue(size.toString());
    const wrapper = mountWithIntl(
      <Pagination table={table} allowSizeChange={true} />
    );
    expect(wrapper.exists(BootstrapPagination)).toBeFalsy();
  });
});

describe("getPaginationRange", () => {
  it("shows fewer previous pages (no padding) when current page is near the start", () => {
    expect(getPaginationRange(9, 1)).toEqual([1, 2, 3, "DOTS", 9]);
  });

  it("shows fewer previous pages (no padding) when current page is near the start of a larger set", () => {
    expect(getPaginationRange(26, 1)).toEqual([1, 2, 3, "DOTS", 26]);
  });

  it("shows fewer next pages (no padding) when current page is near the end", () => {
    expect(getPaginationRange(26, 26)).toEqual([1, "DOTS", 24, 25, 26]);
  });

  it("does not show an ellipsis when the hidden gap would be adjacent to the first page", () => {
    // left sibling is page 2, which is consecutive to page 1 - no gap, no dots
    expect(getPaginationRange(8, 4)).toEqual([1, 2, 3, 4, 5, 6, "DOTS", 8]);
  });

  it("does not show an ellipsis when the hidden gap would be adjacent to the last page", () => {
    // right sibling is the second-to-last page, which is consecutive to the last page - no gap, no dots
    expect(getPaginationRange(8, 5)).toEqual([1, "DOTS", 3, 4, 5, 6, 7, 8]);
  });

  it("collapses both sides into ellipses when current page is in the middle", () => {
    expect(getPaginationRange(26, 13)).toEqual([
      1,
      "DOTS",
      11,
      12,
      13,
      14,
      15,
      "DOTS",
      26,
    ]);
  });

  it("never shows more than two siblings on either side of the current page regardless of position", () => {
    for (let current = 1; current <= 26; current++) {
      const result = getPaginationRange(26, current);
      const consecutiveNumbers = result.filter(
        (p): p is number => p !== "DOTS"
      );
      // first and last page are always included on top of the sibling window,
      // so the window itself contributes at most 5 numbers (current +/- 2);
      // when the window touches page 1 or pageCount, those overlap with the
      // always-shown first/last page.
      const windowNumbers = result.filter(
        (p) => p !== "DOTS" && p !== 1 && p !== 26
      );
      expect(windowNumbers.length).toBeLessThanOrEqual(5);
      expect(consecutiveNumbers.length).toBeLessThanOrEqual(7);
    }
  });
});
