import * as React from "react";
import { ChangeEvent } from "react";
import {
  Pagination as BootstrapPagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import Select from "../Select";
import Constants from "../../../util/Constants";
import { useI18n } from "../../hook/useI18n";
import BrowserStorage from "../../../util/BrowserStorage";
import "./Pagination.scss";
interface PaginationTableState {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface PaginationApi {
  getState: () => PaginationTableState;
  getPageCount: () => number;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
  setPageIndex: (index: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  setPageSize: (size: number) => void;
}

interface PaginationProps {
  table: PaginationApi;
  allowSizeChange?: boolean;
}

const PAGE_SIZES = [10, 20, 30, 50];

export const Pagination: React.FC<PaginationProps> = ({
  table,
  allowSizeChange = false,
}) => {
  const { i18n, formatMessage } = useI18n();

  const pageIndex: number = table.getState().pagination.pageIndex;
  const pageSize: number = table.getState().pagination.pageSize;
  const pageCount: number = table.getPageCount();
  const canPreviousPage: boolean = table.getCanPreviousPage();
  const canNextPage: boolean = table.getCanNextPage();

  React.useEffect(() => {
    const savedPageSize = BrowserStorage.get(
      Constants.STORAGE_TABLE_PAGE_SIZE_KEY
    );
    if (savedPageSize) {
      table.setPageSize(Number(savedPageSize));
    }
  }, [table]);

  const onPageSizeSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    BrowserStorage.set(Constants.STORAGE_TABLE_PAGE_SIZE_KEY, value);
    table.setPageSize(Number(value));
  };

  const items: React.ReactElement[] = [];
  for (let i = 0; i < pageCount; i++) {
    items.push(
      <PaginationItem key={i} active={i === pageIndex}>
        <PaginationLink onClick={() => table.setPageIndex(i)}>
          {i + 1}
        </PaginationLink>
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
              onClick={() => table.setPageIndex(0)}
              title={i18n("table.paging.first.tooltip")}
            />
          </PaginationItem>
          <PaginationItem disabled={!canPreviousPage}>
            <PaginationLink
              previous={true}
              onClick={() => table.previousPage()}
              title={i18n("table.paging.previous.tooltip")}
            />
          </PaginationItem>
          {items}
          <PaginationItem disabled={!canNextPage}>
            <PaginationLink
              next={true}
              onClick={() => table.nextPage()}
              title={i18n("table.paging.next.tooltip")}
            />
          </PaginationItem>
          <PaginationItem disabled={!canNextPage}>
            <PaginationLink
              last={true}
              onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
              title={i18n("table.paging.last.tooltip")}
            />
          </PaginationItem>
        </BootstrapPagination>
      )}
      {allowSizeChange && (
        <div className="page-size-select">
          <Select value={pageSize.toString()} onChange={onPageSizeSelect}>
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {formatMessage("table.paging.pageSize.select", { pageSize: s })}
              </option>
            ))}
            <option
              key={Constants.MAX_PAGE_SIZE}
              value={Constants.MAX_PAGE_SIZE}
            >
              {i18n("table.paging.pageSize.select.all")}
            </option>
          </Select>
        </div>
      )}
    </>
  );
};

export default Pagination;
