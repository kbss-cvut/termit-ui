import * as React from "react";
import {Input} from "reactstrap";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {injectIntl} from "react-intl";

interface TextBasedFilterProps extends HasI18n {
    column: {
        filterValue?: string;
        setFilter: (value?: string) => void;
        preFilteredRows: any[];
    }
}

export function textContainsFilter(rows: any[], id: string, filterValue?: string) {
    return rows.filter(row => {
        const rowValue = row.values[id];
        return rowValue !== undefined ? String(rowValue).toLowerCase().indexOf(String(filterValue).toLowerCase()) !== -1 : true;
    });
}

const TextBasedFilter: React.FC<TextBasedFilterProps> = props => {
    const {filterValue, setFilter, preFilteredRows} = props.column;
    const count = preFilteredRows.length;
    return <Input bsSize="sm" className="mt-1"
                  value={filterValue || ""}
                  onChange={e => {
                      setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
                  }}
                  placeholder={props.formatMessage("table.filter.text.placeholder", {count})}
    />;
}

export default injectIntl(withI18n(TextBasedFilter));
