import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {ThunkDispatch} from "../../util/Types";
import Resource from "../../model/Resource";
import Document from "../../model/Document";
import {loadResources as loadResourcesAction} from "../../action/AsyncActions";
import {Column, Row, useFilters, UseFiltersColumnProps, usePagination, useTable} from "react-table";
import TextBasedFilter, {textContainsFilter} from "../misc/table/TextBasedFilter";
import {Table} from "reactstrap";
import OntologicalVocabulary from "../../util/VocabularyUtils";
import Pagination from "../misc/table/Pagination";
import "./DocumentList.scss";

interface DocumentListProps extends HasI18n {
    documents: Document[];
    load: () => void;
    onSelected: (document: Document) => Promise<void>;
}

export const DocumentList: React.FC<DocumentListProps> = props => {
    const {documents, load, onSelected} = props;
    React.useEffect(() => {
        load();
    }, [load]);
    const columns: Column<Document>[] = React.useMemo(
        () => [
            {
                accessor: "label",
                Filter: TextBasedFilter,
                filter: "text",
                Cell: ({row}) => <>{row.original.label}</>
            }
        ],
        []
    );
    const filterTypes = React.useMemo(() => ({text: textContainsFilter}), []);
    const tableInstance = useTable<Document>(
        {
            columns,
            data: documents,
            // @ts-ignore
            filterTypes
        },
        useFilters,
        usePagination
    );

    const {
        getTableProps,
        getTableBodyProps,
        headers,
        prepareRow,
        // @ts-ignore
        page
    } = tableInstance;

    return (
        <div id="document-list" className="asset-list">
            <Table {...getTableProps()} hover={true} bordered={true} size="sm">
                <thead>
                    <tr>
                        {headers.map(column => {
                            const col: UseFiltersColumnProps<Resource> = column as any;
                            return (
                                <th {...column.getHeaderProps([{className: (column as any).className}])}>
                                    {col.canFilter && <div className="filter-wrapper">{column.render("Filter")}</div>}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row: Row<Document>) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()} onClick={onSelected.bind(this, row.original)}>
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps([{className: (cell.column as any).className}])}>
                                        {cell.render("Cell")}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
            <Pagination
                pagingProps={tableInstance as any}
                pagingState={tableInstance.state as any}
                allowSizeChange={false}
            />
        </div>
    );
};

export default connect(
    (state: TermItState) => {
        return {
            documents: Object.entries(state.resources)
                .filter(r => r[1].hasType(OntologicalVocabulary.DOCUMENT))
                .map(r => r[1] as Document)
                .filter(d => !d.vocabulary)
        };
    },
    (dispatch: ThunkDispatch) => {
        return {
            load: () => dispatch(loadResourcesAction())
        };
    }
)(injectIntl(withI18n(DocumentList)));
