import * as React from "react";
import {TableHeaderProps} from "react-table";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {FaSort, FaSortAlphaDown, FaSortAlphaDownAlt} from "react-icons/fa";
import {injectIntl} from "react-intl";

interface SortToggleProps extends HasI18n {
    sortProps: TableHeaderProps;
    desc?: boolean;
    isSorted?: boolean;
}

const AlphaNumSortToggle: React.FC<SortToggleProps> = props => {
    const {i18n, sortProps, isSorted, desc} = props;
    return <span {...sortProps} className="ml-1 sort-icon" title={i18n("table.sort.tooltip")}>
        {isSorted ? desc ? <FaSortAlphaDownAlt/> : <FaSortAlphaDown/> : <FaSort/>}
    </span>;
}

export default injectIntl(withI18n(AlphaNumSortToggle));
