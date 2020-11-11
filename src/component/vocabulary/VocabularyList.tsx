import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import Vocabulary from "../../model/Vocabulary";
import {Column, useFilters, UseFiltersColumnProps, useSortBy, UseSortByColumnProps, useTable} from "react-table";
import {Table} from "reactstrap";
import "./VocabularyList.scss";
import TextBasedFilter, {textContainsFilter} from "../misc/table/TextBasedFilter";
import VocabularyLink from "./VocabularyLink";
import AlphaNumSortToggle from "../misc/table/AlphaNumSortToggle";

interface VocabularyListProps extends HasI18n {
    onSelect: (voc: Vocabulary) => void;

    vocabularies: { [id: string]: Vocabulary };
    selectedVocabulary: Vocabulary;
    loading: boolean;
}

export const VocabularyList: React.FC<VocabularyListProps> = props => {
    const {vocabularies, i18n} = props;
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
    } as any, useFilters, useSortBy);
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance;

    return <div id="vocabulary-list">
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
            {rows.map(row => {
                prepareRow(row);
                return <tr {...row.getRowProps()}>
                    {row.cells.map(cell =>
                        <td {...cell.getCellProps([{className: (cell.column as any).className}])}>{cell.render("Cell")}</td>)}
                </tr>
            })}
            </tbody>
        </Table>
    </div>;
};

export default connect((state: TermItState) => {
    return {
        vocabularies: state.vocabularies,
        selectedVocabulary: state.vocabulary,
        loading: state.loading
    };
})(injectIntl(withI18n(VocabularyList)));
