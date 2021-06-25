import { Pagination as BootstrapPagination } from "reactstrap";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import { Pagination } from "../Pagination";
import { UsePaginationInstanceProps } from "react-table";
import Constants from "../../../../util/Constants";
import BrowserStorage from "../../../../util/BrowserStorage";

jest.mock("../../../../util/BrowserStorage");

describe("Pagination", () => {
  let pagingProps: UsePaginationInstanceProps<any>;

  beforeEach(() => {
    pagingProps = {
      canNextPage: true,
      page: [],
      canPreviousPage: false,
      gotoPage: jest.fn(),
      nextPage: jest.fn(),
      pageCount: 1,
      pageOptions: [],
      previousPage: jest.fn(),
      setPageSize: jest.fn(),
    };
  });

  it("stores selected page size in local storage", () => {
    const wrapper = mountWithIntl(
      <Pagination
        pagingState={{ pageSize: 10, pageIndex: 0 }}
        pagingProps={pagingProps}
        allowSizeChange={true}
      />
    );
    const sizeSelect = wrapper.find("select");
    const value = 20;
    sizeSelect.simulate("change", { target: { value } });
    expect(pagingProps.setPageSize).toHaveBeenCalledWith(value);
    expect(BrowserStorage.set).toHaveBeenCalledWith(
      Constants.STORAGE_TABLE_PAGE_SIZE_KEY,
      value
    );
  });

  it("loads stored page size on mount", () => {
    const size = 20;
    (BrowserStorage.get as jest.Mock).mockReturnValue(size.toString());
    mountWithIntl(
      <Pagination
        pagingState={{ pageSize: 10, pageIndex: 0 }}
        pagingProps={pagingProps}
        allowSizeChange={true}
      />
    );
    expect(pagingProps.setPageSize).toHaveBeenCalledWith(size);
  });

  it("does not render pagination when page size is greater than item count", () => {
    const size = 20;
    pagingProps.canPreviousPage = false;
    pagingProps.canNextPage = false;
    (BrowserStorage.get as jest.Mock).mockReturnValue(size.toString());
    const wrapper = mountWithIntl(
      <Pagination
        pagingState={{ pageSize: 10, pageIndex: 0 }}
        pagingProps={pagingProps}
        allowSizeChange={true}
      />
    );
    expect(wrapper.exists(BootstrapPagination)).toBeFalsy();
  });
});
