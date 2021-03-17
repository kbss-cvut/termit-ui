import * as React from "react";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import Vocabulary from "../../model/Vocabulary";
import {
    Column,
    Row,
    useFilters,
    UseFiltersColumnProps,
    usePagination,
    useSortBy,
    UseSortByColumnProps,
    useTable
} from "react-table";
import {Table} from "reactstrap";
import TextBasedFilter, {textContainsFilter} from "../misc/table/TextBasedFilter";
import VocabularyLink from "./VocabularyLink";
import AlphaNumSortToggle from "../misc/table/AlphaNumSortToggle";
import Pagination from "../misc/table/Pagination";
import {useI18n} from "../hook/useI18n";

interface VocabularyListProps {
    vocabularies: { [id: string]: Vocabulary };
}

export const VocabularyList: React.FC<VocabularyListProps> = props => {
    const {vocabularies} = props;
    const {i18n} = useI18n();
    const data = React.useMemo(() => Object.keys(vocabularies).map((v) => vocabularies[v]), [vocabularies]);
    const columns: Column<Vocabulary>[] = React.useMemo(() => [{
        Header: i18n("vocabulary.title"),
        accessor: "label",
        Filter: TextBasedFilter,
        filter: "text",
        Cell: ({row}) => <VocabularyLink vocabulary={row.original}/>
    }], [i18n]);
    const filterTypes = React.useMemo(() => ({text: textContainsFilter}), []);
    const tableInstance = useTable<Vocabulary>({
        columns, data, filterTypes, initialState: {
            sortBy: [{
                id: "label",
                desc: false
            }]
        }
    } as any, useFilters, useSortBy, usePagination);
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
    } = tableInstance;
    const page: Row<Vocabulary> [] = (tableInstance as any).page;

    return <div id="vocabulary-list" className="asset-list">
        <Table {...getTableProps()} striped={true} responsive={true}>
            <thead>
            {headerGroups.map(headerGroup => <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => {
                    const col: UseSortByColumnProps<Vocabulary> & UseFiltersColumnProps<Vocabulary> = column as any;
                    return <th {...column.getHeaderProps([{className: (column as any).className}])}>
                        {column.render("Header")}
                        {col.canSort &&
                        <AlphaNumSortToggle sortProps={column.getHeaderProps(col.getSortByToggleProps())}
                                            desc={col.isSortedDesc} isSorted={col.isSorted}/>}
                        {col.canFilter && <div className="filter-wrapper">{column.render("Filter")}</div>}
                    </th>
                })}
            </tr>)}
            </thead>
            <tbody {...getTableBodyProps()}>
            {page.map(row => {
                prepareRow(row);
                return <tr {...row.getRowProps()}>
                    {row.cells.map(cell =>
                        <td {...cell.getCellProps([{className: (cell.column as any).className}])}>{cell.render("Cell")}</td>)}
                </tr>
            })}
            </tbody>
        </Table>
        <Pagination pagingProps={tableInstance as any} pagingState={tableInstance.state as any} allowSizeChange={true}/>
    </div>;
};

export default connect((state: TermItState) => {
    return {
        vocabularies: state.vocabularies
    };
})(VocabularyList);
