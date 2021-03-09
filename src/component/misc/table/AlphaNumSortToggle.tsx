import * as React from "react";
import {TableHeaderProps} from "react-table";
import {FaSort, FaSortAlphaDown, FaSortAlphaDownAlt} from "react-icons/fa";
import {useI18n} from "../../hook/useI18n";

interface SortToggleProps {
    sortProps: TableHeaderProps;
    desc?: boolean;
    isSorted?: boolean;
}

const AlphaNumSortToggle: React.FC<SortToggleProps> = props => {
    const {sortProps, isSorted, desc} = props;
    const {i18n} = useI18n();
    return <span {...sortProps} className="ml-1 sort-icon" title={i18n("table.sort.tooltip")}>
        {isSorted ? desc ? <FaSortAlphaDownAlt/> : <FaSortAlphaDown/> : <FaSort/>}
    </span>;
}

export default AlphaNumSortToggle;
