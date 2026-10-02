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

export const PAGE_SIZES = [10, 20, 30, 50];

const DOTS = "DOTS";

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

/**
 * Computes the list of page numbers (1-indexed) to display, collapsing
 * pages that are far from the current one into ellipsis ("...") markers.
 * At most siblingCount pages before and after the current page are shown
 * (fewer when the current page is near a boundary - the window is not
 * padded out to a fixed size), with the first and last page always visible.
 *
 * E.g. for pageCount = 10, currentPage = 5, siblingCount = 2, this produces
 * 1, DOTS, 3, 4, 5, 6, 7, DOTS, 10.
 */
export function getPaginationRange(
  pageCount: number,
  currentPage: number,
  siblingCount = 2
): (number | typeof DOTS)[] {
  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, pageCount);

  const pages: (number | typeof DOTS)[] = [];

  if (leftSibling > 1) {
    pages.push(1);
    // An ellipsis is only needed if there is a gap of more than one page
    // between the first page and the start of the window (otherwise they
    // are consecutive and no pages are actually being hidden).
    if (leftSibling > 2) {
      pages.push(DOTS);
    }
  }

  pages.push(...range(leftSibling, rightSibling));

  if (rightSibling < pageCount) {
    if (rightSibling < pageCount - 1) {
      pages.push(DOTS);
    }
    pages.push(pageCount);
  }

  return pages;
}

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

  const paginationRange = getPaginationRange(pageCount, pageIndex + 1);
  const items: React.ReactElement[] = paginationRange.map((page, idx) =>
    page === DOTS ? (
      <PaginationItem key={`dots-${idx}`} disabled={true}>
        <PaginationLink tag="span">&hellip;</PaginationLink>
      </PaginationItem>
    ) : (
      <PaginationItem key={page} active={page - 1 === pageIndex}>
        <PaginationLink onClick={() => table.setPageIndex(page - 1)}>
          {page}
        </PaginationLink>
      </PaginationItem>
    )
  );

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
