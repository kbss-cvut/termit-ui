import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {injectIntl} from "react-intl";
import {Input} from "reactstrap";

interface SelectFilterProps extends HasI18n {
    column: {
        filterValue?: string;
        setFilter: (value?: string) => void;
        preFilteredRows: any[];
    }
}

export function createSelectFilter(getValue: (row: any) => string, getLabel: (value: string) => string) {
    let SelectFilter: React.FC<SelectFilterProps> = props => {
        const {filterValue, setFilter, preFilteredRows} = props.column;
        const options: string[] = React.useMemo<string[]>(() => {
            const opts = new Set<string>();
            preFilteredRows.forEach((row: any) => {
                opts.add(getValue(row.values));
            });
            return [...opts.values()];
        }, [preFilteredRows]);

        return <Input bsSize="sm" type="select" value={filterValue} className="m-table-select-filter"
                      onChange={e => {
                          setFilter(e.target.value || undefined);
                      }}>
            <option value="">{props.i18n("table.filter.select.all")}</option>
            {options.map((option: string, i: number) => (
                <option key={i} value={option}>
                    {getLabel(option)}
                </option>
            ))}
        </Input>;
    };

    SelectFilter = injectIntl(withI18n(SelectFilter));
    return SelectFilter;
}
