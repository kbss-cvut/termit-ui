import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import Vocabulary from "../../model/Vocabulary";
import {Column, useFilters, useSortBy, useTable} from "react-table";
import {Table} from "reactstrap";
import "./VocabularyList.scss";
import {FaSort, FaSortDown, FaSortUp} from "react-icons/fa";
import TextBasedFilter, {textContainsFilter} from "../misc/table/TextBasedFilter";

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
        filter: "text"
    }, {
        Header: i18n("vocabulary.comment"),
        accessor: "comment",
        disableFilters: true,
        disableSortBy: true
    }], [i18n]);
    const filterTypes = React.useMemo(() => ({text: textContainsFilter}), []);
    const tableInstance = useTable<Vocabulary>({columns, data, filterTypes} as any, useFilters, useSortBy);
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
                {// Loop over the headers in each row
                    headerGroup.headers.map(column => (
                        // Apply the header cell props
                        <th {...column.getHeaderProps()}>
                            {column.render("Header")}
                            {(column as any).canSort &&
                            <span {...column.getHeaderProps((column as any).getSortByToggleProps())}>{(column as any).isSorted ? (column as any).isSortedDesc ?
                                <FaSortDown/> : <FaSortUp/> : <FaSort/>}</span>}
                            {<div>{(column as any).canFilter ? column.render("Filter") : null}</div>}
                        </th>
                    ))}
            </tr>)}
            </thead>
            <tbody {...getTableBodyProps()}>
            {rows.map(row => {
                // Prepare the row for display
                prepareRow(row);
                return <tr {...row.getRowProps()}>
                    {// Loop over the rows cells
                        row.cells.map(cell => {
                            // Apply the cell props
                            return <td {...cell.getCellProps()}>
                                {// Render the cell contents
                                    cell.render("Cell")}
                            </td>;
                        })}
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
