import * as React from "react";
import { ChangeEvent } from "react";
import { UsePaginationInstanceProps, UsePaginationState } from "react-table";
import {
  Pagination as BootstrapPagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import Select from "../Select";
import "./Pagination.scss";
import Constants from "../../../util/Constants";
import { useI18n } from "../../hook/useI18n";
import BrowserStorage from "../../../util/BrowserStorage";

interface PaginationProps {
  pagingProps: UsePaginationInstanceProps<any>;
  pagingState: UsePaginationState<any>;
  allowSizeChange?: boolean;
}

const PAGE_SIZES = [10, 20, 30, 50];
const INFINITE_PAGE = Number.MAX_SAFE_INTEGER;

export const Pagination: React.FC<PaginationProps> = (props) => {
  const { i18n, formatMessage } = useI18n();
  const {
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = props.pagingProps;
  const { pageIndex, pageSize } = props.pagingState;
  React.useEffect(() => {
    const savedPageSize = BrowserStorage.get(
      Constants.STORAGE_TABLE_PAGE_SIZE_KEY
    );
    if (savedPageSize) {
      setPageSize(Number(savedPageSize));
    }
  }, [setPageSize]);
  const onPageSizeSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    BrowserStorage.set(Constants.STORAGE_TABLE_PAGE_SIZE_KEY, value);
    setPageSize(Number(value));
  };

  const items = [];
  for (let i = 0; i < pageCount; i++) {
    items.push(
      <PaginationItem key={i} active={i === pageIndex}>
        <PaginationLink onClick={() => gotoPage(i)}>{i + 1}</PaginationLink>
      </PaginationItem>
    );
  }

  return (
    <>
      {(canNextPage || canPreviousPage) && (
        <BootstrapPagination aria-label="Table page navigation">
          <PaginationItem disabled={!canPreviousPage}>
            <PaginationLink
              first={true}
              onClick={() => gotoPage(0)}
              title={i18n("table.paging.first.tooltip")}
            />
          </PaginationItem>
          <PaginationItem disabled={!canPreviousPage}>
            <PaginationLink
              previous={true}
              onClick={() => previousPage()}
              title={i18n("table.paging.previous.tooltip")}
            />
          </PaginationItem>
          {items}
          <PaginationItem disabled={!canNextPage}>
            <PaginationLink
              next={true}
              onClick={() => nextPage()}
              title={i18n("table.paging.next.tooltip")}
            />
          </PaginationItem>
          <PaginationItem disabled={!canNextPage}>
            <PaginationLink
              last={true}
              onClick={() => gotoPage(pageCount - 1)}
              title={i18n("table.paging.last.tooltip")}
            />
          </PaginationItem>
        </BootstrapPagination>
      )}
      {props.allowSizeChange && (
        <div className="page-size-select">
          <Select value={pageSize.toString()} onChange={onPageSizeSelect}>
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {formatMessage("table.paging.pageSize.select", { pageSize: s })}
              </option>
            ))}
            <option key={INFINITE_PAGE} value={INFINITE_PAGE}>
              {i18n("table.paging.pageSize.select.all")}
            </option>
          </Select>
        </div>
      )}
    </>
  );
};

Pagination.defaultProps = {
  allowSizeChange: false,
};

export default Pagination;
