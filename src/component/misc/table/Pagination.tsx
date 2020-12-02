import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {UsePaginationInstanceProps, UsePaginationState} from "react-table";
import {Pagination as BootstrapPagination, PaginationItem, PaginationLink} from "reactstrap";
import {injectIntl} from "react-intl";
import Select from "../Select";
import "./Pagination.scss";

interface PaginationProps extends HasI18n {
    pagingProps: UsePaginationInstanceProps<any>;
    pagingState: UsePaginationState<any>;
    allowSizeChange?: boolean;
}

const PAGE_SIZES = [10, 20, 30, 50];

const Pagination: React.FC<PaginationProps> = props => {
    const {i18n, formatMessage} = props;
    const {
        canPreviousPage,
        canNextPage,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize
    } = props.pagingProps;
    const {pageIndex, pageSize} = props.pagingState;

    const items = [];
    for (let i = 0; i < pageCount; i++) {
        items.push(<PaginationItem key={i} active={i === pageIndex}>
            <PaginationLink onClick={() => gotoPage(i)}>{i + 1}</PaginationLink>
        </PaginationItem>);
    }

    return <>
        <BootstrapPagination aria-label="Table page navigation">
            <PaginationItem disabled={!canPreviousPage}>
                <PaginationLink first={true} onClick={() => gotoPage(0)} title={i18n("table.paging.first.tooltip")}/>
            </PaginationItem>
            <PaginationItem disabled={!canPreviousPage}>
                <PaginationLink previous={true} onClick={() => previousPage()}
                                title={i18n("table.paging.previous.tooltip")}/>
            </PaginationItem>
            {items}
            <PaginationItem disabled={!canNextPage}>
                <PaginationLink next={true} onClick={() => nextPage()} title={i18n("table.paging.next.tooltip")}/>
            </PaginationItem>
            <PaginationItem disabled={!canNextPage}>
                <PaginationLink last={true} onClick={() => gotoPage(pageCount - 1)}
                                title={i18n("table.paging.last.tooltip")}/>
            </PaginationItem>
        </BootstrapPagination>
        {props.allowSizeChange &&
        <div className="page-size-select"><Select value={pageSize.toString()}
                                                  onChange={(e) => setPageSize(Number(e.target.value))}>
            {PAGE_SIZES.map(s => <option key={s}
                                         value={s}>{formatMessage("table.paging.pageSize.select", {pageSize})}</option>)}
        </Select></div>}
    </>;
};

Pagination.defaultProps = {
    allowSizeChange: false
};

export default injectIntl(withI18n(Pagination));
