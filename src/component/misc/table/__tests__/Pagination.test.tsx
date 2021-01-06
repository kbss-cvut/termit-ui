import React from "react";
import {Pagination as BootstrapPagination} from "reactstrap";
import {mountWithIntl} from "../../../../__tests__/environment/Environment";
import {Pagination} from "../Pagination";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import {UsePaginationInstanceProps} from "react-table";
import Constants from "../../../../util/Constants";

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
            setPageSize: jest.fn()
        };
        localStorage.clear();
    })

    it("stores selected page size in local storage", () => {
        const wrapper = mountWithIntl(<Pagination pagingState={{pageSize: 10, pageIndex: 0}} pagingProps={pagingProps}
                                                  allowSizeChange={true} {...intlFunctions()}/>);
        const sizeSelect = wrapper.find("select");
        const value = 20;
        sizeSelect.simulate("change", {target: {value}});
        expect(pagingProps.setPageSize).toHaveBeenCalledWith(value);
        expect(localStorage.setItem).toHaveBeenCalledWith(Constants.STORAGE_TABLE_PAGE_SIZE_KEY, value);
    });

    it("loads stored page size on mount", () => {
        const size = 20;
        localStorage.__STORE__[Constants.STORAGE_TABLE_PAGE_SIZE_KEY] = size.toString();
        mountWithIntl(<Pagination pagingState={{pageSize: 10, pageIndex: 0}} pagingProps={pagingProps}
                                  allowSizeChange={true} {...intlFunctions()}/>);
        expect(pagingProps.setPageSize).toHaveBeenCalledWith(size);
    });

    it("does not render pagination when page size is greater than item count", () => {
        const size = 20;
        pagingProps.canPreviousPage = false;
        pagingProps.canNextPage = false;
        localStorage.__STORE__[Constants.STORAGE_TABLE_PAGE_SIZE_KEY] = size.toString();
        const wrapper = mountWithIntl(<Pagination pagingState={{pageSize: 10, pageIndex: 0}} pagingProps={pagingProps}
                                                  allowSizeChange={true} {...intlFunctions()}/>);
        expect(wrapper.exists(BootstrapPagination)).toBeFalsy();
    });
});
