import { Pagination as BootstrapPagination } from "reactstrap";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import { Pagination, PaginationApi } from "../Pagination";
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
