import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {ThunkDispatch} from "../../util/Types";
import Resource from "../../model/Resource";
import {loadResources as loadResourcesAction} from "../../action/AsyncActions";
import {consumeNotification as consumeNotificationAction} from "../../action/SyncActions";
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
import TextBasedFilter, {textContainsFilter} from "../misc/table/TextBasedFilter";
import ResourceLink from "./ResourceLink";
import {Table} from "reactstrap";
import AlphaNumSortToggle from "../misc/table/AlphaNumSortToggle";
import Pagination from "../misc/table/Pagination";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";
import AppNotification from "../../model/AppNotification";

interface ResourceListProps extends HasI18n {
    resources: { [key: string]: Resource },
    notifications: AppNotification[];
    loadResources: () => void;
    consumeNotification: (notification: AppNotification) => void;
}

export const ResourceList: React.FC<ResourceListProps> = props => {
    const {i18n, resources, notifications, loadResources, consumeNotification} = props;
    React.useEffect(() => {
        loadResources();
    }, [loadResources]);
    const resourceUpdate = notifications.find(Utils.generateIsAssetLabelUpdate(VocabularyUtils.RESOURCE));
    if (resourceUpdate) {
        loadResources();
        consumeNotification(resourceUpdate);
    }
    const data = React.useMemo(() => Object.keys(resources).map((r) => resources[r]), [resources]);
    const columns: Column<Resource>[] = React.useMemo(() => [{
        Header: i18n("asset.label"),
        accessor: "label",
        Filter: TextBasedFilter,
        filter: "text",
        Cell: ({row}) => <ResourceLink resource={row.original}/>
    }], [i18n]);
    const filterTypes = React.useMemo(() => ({text: textContainsFilter}), []);
    const tableInstance = useTable<Resource>({
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
    const page: Row<Resource> [] = (tableInstance as any).page;

    return <div id="resource-list" className="asset-list">
        <Table {...getTableProps()} striped={true} responsive={true}>
            <thead>
            {headerGroups.map(headerGroup => <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => {
                    const col: UseSortByColumnProps<Resource> & UseFiltersColumnProps<Resource> = column as any;
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
}

export default connect((state: TermItState) => {
    return {
        resources: state.resources,
        notifications: state.notifications
    }
}, (dispatch: ThunkDispatch) => {
    return {
        loadResources: () => dispatch(loadResourcesAction()),
        consumeNotification: (notification: AppNotification) => dispatch(consumeNotificationAction(notification))
    }
})(injectIntl(withI18n(ResourceList)));
