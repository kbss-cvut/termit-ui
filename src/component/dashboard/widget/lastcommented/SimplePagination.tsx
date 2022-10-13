import React from "react";
import { useI18n } from "../../../hook/useI18n";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

interface SimplePaginationProps {
  page: number;
  setPage: (pageNo: number) => void;
  pageSize: number;
  itemCount?: number;
}

const SimplePagination: React.FC<SimplePaginationProps> = ({
  page,
  setPage,
  itemCount = 0,
  pageSize,
}) => {
  const { i18n } = useI18n();

  return (
    <>
      <Pagination aria-label="Last commented assets pagination">
        <PaginationItem disabled={page === 0}>
          <PaginationLink
            first={true}
            onClick={() => setPage(0)}
            title={i18n("table.paging.first.tooltip")}
          />
        </PaginationItem>
        <PaginationItem disabled={page === 0}>
          <PaginationLink
            previous={true}
            onClick={() => setPage(page - 1)}
            title={i18n("table.paging.previous.tooltip")}
          />
        </PaginationItem>
        <PaginationItem active={true}>
          <PaginationLink disabled={true}>{page + 1}</PaginationLink>
        </PaginationItem>
        <PaginationItem disabled={itemCount < pageSize}>
          <PaginationLink
            next={true}
            onClick={() => setPage(page + 1)}
            title={i18n("table.paging.next.tooltip")}
          />
        </PaginationItem>
      </Pagination>
    </>
  );
};

export default SimplePagination;
